# 本应用没有反射、没有第三方 SDK，保持默认规则即可。
# WebView 通过 JS 桥接访问的方法（若有）需要保留，这里预留：
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
