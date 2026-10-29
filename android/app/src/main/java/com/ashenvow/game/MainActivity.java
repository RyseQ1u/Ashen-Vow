package com.ashenvow.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

/**
 * 应用唯一入口：把离线网页版《灰烬誓约》装进全屏 WebView。
 *
 * 设计要点
 * 1. 页面来源固定为 https://appassets.androidplatform.net —— 虚拟 https 域名，
 *    属于「安全来源」，因此 localStorage / IndexedDB 存档不会被 WebView 拒绝
 *    （直接用 file:// 加载时 IndexedDB 会抛 SecurityError）。
 * 2. 页面资源全部来自 APK 内的 assets/www，运行全程不需要网络。
 * 3. 返回键先交给页面（等同按 Esc，用于取消技能选择等），2 秒内再按一次才退出，
 *    避免误触直接杀进程丢进度。
 * 4. 退到后台时暂停 WebView 的渲染与定时器，回到前台恢复，省电且不会出现
 *    「后台继续跑回合」的问题。
 */
public class MainActivity extends Activity implements LocalWebViewClient.PageStateListener {

    private static final String TAG = "AshenVow";
    private static final long EXIT_INTERVAL_MS = 2_000L;

    /** 返回键在页面内先派发一次 Esc：与网页版键盘快捷键行为保持一致。 */
    private static final String BACK_HOOK_JS =
            "(function(){try{"
                    + "var e=new KeyboardEvent('keydown',{key:'Escape',code:'Escape',keyCode:27,which:27,bubbles:true,cancelable:true});"
                    + "window.dispatchEvent(e);"
                    + "return 'ok';"
                    + "}catch(err){return 'err';}})()";

    private WebView webView;
    private View errorPanel;
    private TextView errorDetail;
    private long lastBackPressedAt = 0L;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // 启动主题只负责「冷启动那一帧」的深色背景与品牌图标，进入界面后立即切换
        setTheme(R.style.Theme_AshenVow);
        super.onCreate(savedInstanceState);
        // 战斗/阅读场景下不让屏幕自动熄灭
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.game_webview);
        errorPanel = findViewById(R.id.error_panel);
        errorDetail = findViewById(R.id.error_detail);

        configureWebView(webView);

        if (savedInstanceState != null) {
            // 系统回收后重建：恢复 WebView 历史，避免重走一次加载
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(LocalWebViewClient.START_URL);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView(WebView view) {
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);          // 游戏逻辑全部在前端 JS
        settings.setDomStorageEnabled(true);          // 设置项（音量/速度等）用 localStorage
        settings.setDatabaseEnabled(true);            // IndexedDB 存档依赖此项
        settings.setAllowFileAccess(false);           // 页面不需要读本地文件，直接关掉
        settings.setAllowContentAccess(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setSupportZoom(false);               // 已按手机宽度适配，禁用手势缩放
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setTextZoom(100);                    // 不跟随系统字体缩放，防止版式被撑破
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setUserAgentString(settings.getUserAgentString() + " AshenVowApp/" + BuildConfig.VERSION_NAME);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // 纯离线内容，关闭安全浏览的网络查询
            settings.setSafeBrowsingEnabled(false);
        }

        view.setBackgroundColor(getColor(R.color.av_ink));
        view.setOverScrollMode(View.OVER_SCROLL_NEVER);
        view.setVerticalScrollBarEnabled(false);
        view.setHorizontalScrollBarEnabled(false);
        // 长按不弹出「保存图片/复制」菜单，保持游戏观感
        view.setOnLongClickListener(v -> true);
        view.setWebViewClient(new LocalWebViewClient(this, this));
        view.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage message) {
                Log.d(TAG, "console " + message.message() + " @" + message.sourceId() + ":" + message.lineNumber());
                return true;
            }
        });

        if (BuildConfig.DEBUG) {
            // 调试包可用 chrome://inspect 远程调试页面
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }

    // ---------------- 页面状态回调（来自 LocalWebViewClient） ----------------

    @Override
    public void onPageLoaded() {
        errorPanel.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
    }

    @Override
    public void onPageFailed(String message) {
        Log.e(TAG, "page failed: " + message);
        errorDetail.setText(message);
        webView.setVisibility(View.GONE);
        errorPanel.setVisibility(View.VISIBLE);
    }

    /** 错误页的「重新加载」按钮 */
    public void onReloadClicked(View view) {
        errorPanel.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        webView.loadUrl(LocalWebViewClient.START_URL);
    }

    // ---------------- 生命周期 ----------------

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();     // 停止 JS 定时器，避免后台空转耗电
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.resumeTimers();
            webView.onResume();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.setWebViewClient(null);
            webView.destroy();          // 必须销毁，否则 WebView 会泄漏 Activity
            webView = null;
        }
        super.onDestroy();
    }

    // ---------------- 返回键 ----------------

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        // 先让页面处理（例如取消已选技能），再决定是否提示退出
        webView.evaluateJavascript(BACK_HOOK_JS, value -> handleBackPressed());
    }

    private void handleBackPressed() {
        long now = SystemClock.uptimeMillis();
        if (lastBackPressedAt > 0 && now - lastBackPressedAt < EXIT_INTERVAL_MS) {
            lastBackPressedAt = 0L;
            finish();
        } else {
            lastBackPressedAt = now;
            Toast.makeText(this, R.string.exit_hint, Toast.LENGTH_SHORT).show();
        }
    }
}
