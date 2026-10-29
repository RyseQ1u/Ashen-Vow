#!/usr/bin/env bash
# 灰烬誓约 · macOS / Linux 打包脚本
set -euo pipefail
cd "$(dirname "$0")"

echo "============================================"
echo " 灰烬誓约 - Android 打包"
echo "============================================"

# 1. JDK 17+ 检查
if ! command -v java >/dev/null 2>&1; then
  echo "[错误] 未找到 java，请安装 JDK 17/21 并设置 JAVA_HOME"
  exit 1
fi
JAVA_MAJOR=$(java -version 2>&1 | awk -F'"' '/version/ {print $2}' | cut -d. -f1)
if [ "${JAVA_MAJOR}" -lt 17 ]; then
  echo "[错误] 当前 Java 版本为 ${JAVA_MAJOR}，AGP 8.5 需要 JDK 17 及以上"
  exit 1
fi
echo "[1/4] Java $(java -version 2>&1 | head -1)"

# 2. Android SDK
if [ ! -f local.properties ]; then
  SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
  if [ -z "$SDK" ]; then
    echo "[错误] 未找到 Android SDK：请创建 android/local.properties 写入 sdk.dir=<SDK 路径>"
    exit 1
  fi
  echo "sdk.dir=$SDK" > local.properties
fi
echo "[2/4] Android SDK 配置就绪"

# 3. 编译
echo "[3/4] 编译中..."
./gradlew assembleDebug assembleRelease
echo "[4/4] 输出到 dist/"
mkdir -p dist
cp -f app/build/outputs/apk/debug/app-debug.apk dist/ashen-vow-debug.apk
cp -f app/build/outputs/apk/release/app-release.apk dist/ashen-vow-release.apk

echo "完成：dist/ashen-vow-debug.apk、dist/ashen-vow-release.apk"
