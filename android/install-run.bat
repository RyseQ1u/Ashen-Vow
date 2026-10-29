@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

REM 安装已签名的发布包到已连接的手机/模拟器，并直接启动
set "ADB=adb"
where adb >nul 2>nul
if errorlevel 1 (
    if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
        set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
    ) else (
        echo [错误] 未找到 adb，请安装 Android Platform-Tools 或把 platform-tools 加入 PATH。
        pause
        exit /b 1
    )
)

if not exist "dist\ashen-vow-release.apk" (
    echo [错误] 未找到 dist\ashen-vow-release.apk，请先运行 build-apk.bat
    pause
    exit /b 1
)

echo 已连接设备：
"%ADB%" devices
echo.
echo 正在安装...
"%ADB%" install -r "dist\ashen-vow-release.apk"
if errorlevel 1 (
    echo [失败] 安装未成功，请检查设备是否开启 USB 调试。
    pause
    exit /b 1
)

echo 启动游戏...
"%ADB%" shell am start -n com.ashenvow.game/com.ashenvow.game.MainActivity
pause
