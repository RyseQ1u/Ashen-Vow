import java.util.Properties

/*
 * 灰烬誓约 · app 模块构建配置
 * ------------------------------------------------------------
 * 这是一个「原生壳 + 离线网页」的 Android 应用：
 *   - 不含任何第三方依赖（无 AndroidX、无网络库），构建体积小、失败点少；
 *   - 游戏本体（单文件 HTML）放在 assets/www/index.html，由 MainActivity 内的
 *     WebView 通过 https://appassets.androidplatform.net 虚拟域名加载，
 *     以获得安全来源（secure origin），保证 localStorage / IndexedDB 存档可用。
 */
plugins {
    id("com.android.application")
}

// ---------- 发布签名（可选） ----------
// 若存在 android/keystore.properties，则 release 使用自有证书签名；
// 否则 release 复用 debug 证书，保证「任何机器 clone 下来都能直接出包」。
val keystorePropsFile = rootProject.file("keystore.properties")
val keystoreProps = Properties().apply {
    if (keystorePropsFile.exists()) keystorePropsFile.inputStream().use { load(it) }
}
val hasReleaseKeystore = keystoreProps.getProperty("storeFile") != null

android {
    namespace = "com.ashenvow.game"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.ashenvow.game"
        minSdk = 23          // Android 6.0+，覆盖绝大多数在用机型
        targetSdk = 34       // Android 14
        versionCode = 11001
        versionName = "1.1.1"
        // 游戏只有中文/英文两套文案（页面内自带），无需按语言拆分资源
        resourceConfigurations += listOf("zh", "en")
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                storeFile = rootProject.file(keystoreProps.getProperty("storeFile"))
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = false       // 壳层代码极少，混淆收益低、排查成本高
            isShrinkResources = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.findByName("release")
                ?: signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = true
    }

    lint {
        // 发布包不因 lint 告警中断；需要体检时单独执行 ./gradlew lint
        checkReleaseBuilds = false
        abortOnError = false
    }
}

dependencies {
    // 刻意留空：本应用只使用 Android 框架 API
}

// ---------- 网页资源同步 ----------
// 每次构建前把仓库里的最新单文件网页版同步进 assets，避免「改了网页忘了拷进 App」。
// 可用 -Pashenvow.webHtml=<相对仓库根目录的路径> 指定其它构建产物。
val webHtmlFile: File = (project.findProperty("ashenvow.webHtml") as String?)
    ?.let { rootProject.file(it) }
    ?: rootProject.file("../ashenvow-src/ashen-vow-play-v1.0.html")

val syncWebAssets = tasks.register<Copy>("syncWebAssets") {
    group = "ashenvow"
    description = "将单文件网页版复制为 app/src/main/assets/www/index.html"
    from(webHtmlFile) { rename { "index.html" } }
    into(layout.projectDirectory.dir("src/main/assets/www"))
    doFirst {
        if (!webHtmlFile.isFile) {
            throw GradleException("找不到网页构建产物：${webHtmlFile.absolutePath}\n请先执行 `npm run build:standalone`，或用 -Pashenvow.webHtml=... 指定文件。")
        }
    }
}

tasks.named("preBuild") { dependsOn(syncWebAssets) }
