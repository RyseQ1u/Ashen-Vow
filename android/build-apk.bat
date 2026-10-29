@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo  灰烬誓约 - Android 打包脚本
echo ============================================

REM ---------- 1. 找到 JDK 17 及以上 ----------
call :detect_java
if not defined JAVA_OK (
    echo [错误] 未找到 JDK 17 及以上版本。
    echo        请安装 JDK 17/21，并把 JAVA_HOME 指向它后重试。
    pause
    exit /b 1
)
echo [1/4] 使用 JDK: %JAVA_HOME%

REM ---------- 2. 检查 Android SDK ----------
if not exist "local.properties" (
    if defined ANDROID_SDK_ROOT (
        echo sdk.dir=%ANDROID_SDK_ROOT:\=/%> local.properties
    ) else if defined ANDROID_HOME (
        echo sdk.dir=%ANDROID_HOME:\=/%> local.properties
    ) else (
        echo [错误] 缺少 local.properties，且未设置 ANDROID_SDK_ROOT / ANDROID_HOME。
        echo        请创建 android\local.properties 并写入：
        echo        sdk.dir=C:/Users/你的用户名/AppData/Local/Android/Sdk
        pause
        exit /b 1
    )
)
echo [2/4] Android SDK 配置就绪

REM ---------- 3. 编译 ----------
echo [3/4] 开始编译（首次构建需要下载 Gradle 依赖，请耐心等待）...
call gradlew.bat assembleDebug assembleRelease
if errorlevel 1 (
    echo.
    echo [失败] 编译未通过，请查看上方 Gradle 报错。
    pause
    exit /b 1
)

REM ---------- 4. 收集产物 ----------
echo [4/4] 收集安装包到 dist 目录...
if not exist "dist" mkdir "dist"
copy /y "app\build\outputs\apk\debug\app-debug.apk" "dist\ashen-vow-debug.apk" >nul
copy /y "app\build\outputs\apk\release\app-release.apk" "dist\ashen-vow-release.apk" >nul

echo.
echo ============================================
echo  打包完成
echo    调试包: %CD%\dist\ashen-vow-debug.apk
echo    发布包: %CD%\dist\ashen-vow-release.apk
echo ============================================
pause
exit /b 0

REM ================= 子程序 =================
:detect_java
set "JAVA_OK="
if defined JAVA_HOME call :try_java "%JAVA_HOME%"
if defined JAVA_OK goto :eof
for %%J in (
    "%LOCALAPPDATA%\Programs\Android Studio\jbr"
    "C:\Program Files\Android\Android Studio\jbr"
    "D:\SDK\.jdks\ms-21.0.11"
    "D:\SDK\.jdks\ms-17.0.13"
    "C:\Program Files\Java\jdk-21"
) do (
    if not defined JAVA_OK call :try_java "%%~J"
)
goto :eof

:try_java
if not exist "%~1\bin\javac.exe" goto :eof
set "VER="
for /f "usebackq tokens=2 delims==" %%v in (`findstr /b /c:"JAVA_VERSION" "%~1\release" 2^>nul`) do set "VER=%%~v"
if not defined VER goto :eof
echo %VER% | findstr /b /c:"1." >nul && goto :eof
set "JAVA_HOME=%~1"
set "JAVA_OK=1"
goto :eof
