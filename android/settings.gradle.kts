// 灰烬誓约 · Android 工程入口
// 说明：只声明一个 :app 模块；插件仓库锁定 Google / Maven Central，避免依赖来源不确定。
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "AshenVow"
include(":app")
