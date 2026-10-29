package com.ashenvow.game;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * 本地资源客户端：把虚拟域名 https://appassets.androidplatform.net/xxx
 * 的请求映射到 APK 内的 assets/www/xxx。
 *
 * 为什么不直接 loadUrl("file:///android_asset/...")？
 *   file:// 属于不透明来源，WebView 会拒绝 IndexedDB 写入，游戏存档直接失效。
 *   用 https 虚拟域名后，等同普通网站，存档、localStorage 全部正常。
 *
 * 为什么不用 WebViewAssetLoader（androidx.webkit）？
 *   本工程刻意零第三方依赖，自己实现 40 行映射即可，构建更可控、包体更小。
 */
class LocalWebViewClient extends WebViewClient {

    private static final String TAG = "AshenVow";

    /** 虚拟站点域名与入口地址（页面内不要写死，统一从这里取） */
    static final String HOST = "appassets.androidplatform.net";
    static final String ORIGIN = "https://" + HOST;
    static final String START_URL = ORIGIN + "/index.html";

    /** assets 下存放网页资源的目录 */
    private static final String ASSET_ROOT = "www";

    private static final String INJECT_JS =
            "(function(){"
                    + "if(window.__ashenVowNative){return;}"
                    + "window.__ashenVowNative=true;"
                    + "document.documentElement.classList.add('native-android');"
                    + "var s=document.createElement('style');"
                    + "s.textContent='html{-webkit-text-size-adjust:100%;}*{-webkit-tap-highlight-color:transparent;}';"
                    + "document.head.appendChild(s);"
                    + "document.addEventListener('gesturestart',function(e){e.preventDefault();},{passive:false});"
                    + "document.addEventListener('contextmenu',function(e){e.preventDefault();});"
                    + "})()";

    interface PageStateListener {
        void onPageLoaded();

        void onPageFailed(String message);
    }

    private final Context context;
    private final PageStateListener listener;

    LocalWebViewClient(Context context, PageStateListener listener) {
        this.context = context.getApplicationContext();
        this.listener = listener;
    }

    // ---------------- 资源接管 ----------------

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        if (uri == null || !HOST.equals(uri.getHost())) {
            return null;                        // 非本地资源交给系统默认处理
        }
        return serveAsset(uri.getPath());
    }

    private WebResourceResponse serveAsset(String rawPath) {
        String path = rawPath == null ? "" : rawPath;
        while (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (path.isEmpty() || path.endsWith("/")) {
            path = path + "index.html";
        }
        if (path.contains("..")) {
            return notFound();
        }

        InputStream stream;
        try {
            stream = context.getAssets().open(ASSET_ROOT + "/" + path);
        } catch (IOException e) {
            Log.w(TAG, "asset missing: " + path);
            return notFound();
        }

        String mime = mimeTypeOf(path);
        String encoding = isTextual(mime) ? "utf-8" : null;
        return new WebResourceResponse(mime, encoding, 200, "OK", noStoreHeaders(), stream);
    }

    private WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found",
                noStoreHeaders(), new ByteArrayInputStream(new byte[0]));
    }

    private static Map<String, String> noStoreHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Cache-Control", "no-store");
        return headers;
    }

    private static boolean isTextual(String mime) {
        return mime.startsWith("text/")
                || mime.contains("javascript")
                || mime.contains("json")
                || mime.contains("svg")
                || mime.contains("xml");
    }

    private static String mimeTypeOf(String path) {
        int dot = path.lastIndexOf('.');
        String ext = dot < 0 ? "" : path.substring(dot + 1).toLowerCase(Locale.ROOT);
        switch (ext) {
            case "html":
            case "htm":
                return "text/html";
            case "js":
            case "mjs":
                return "application/javascript";
            case "css":
                return "text/css";
            case "json":
                return "application/json";
            case "svg":
                return "image/svg+xml";
            case "png":
                return "image/png";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "webp":
                return "image/webp";
            case "gif":
                return "image/gif";
            case "ico":
                return "image/x-icon";
            case "woff":
                return "font/woff";
            case "woff2":
                return "font/woff2";
            case "ttf":
                return "font/ttf";
            case "otf":
                return "font/otf";
            case "mp3":
                return "audio/mpeg";
            case "ogg":
            case "oga":
                return "audio/ogg";
            case "wav":
                return "audio/wav";
            case "mp4":
                return "video/mp4";
            case "txt":
            case "md":
                return "text/plain";
            default:
                return "application/octet-stream";
        }
    }

    // ---------------- 链接策略 ----------------

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        return handleUrl(request.getUrl());
    }

    @SuppressWarnings("deprecation")
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        return handleUrl(Uri.parse(url));
    }

    private boolean handleUrl(Uri uri) {
        if (uri == null) {
            return true;
        }
        if (HOST.equals(uri.getHost())) {
            return false;                       // 本地页面内跳转，照常处理
        }
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if ("http".equals(scheme) || "https".equals(scheme)) {
            // 外链交给系统浏览器，App 内不打开任意网页
            try {
                context.startActivity(new Intent(Intent.ACTION_VIEW, uri)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (ActivityNotFoundException e) {
                Toast.makeText(context, R.string.no_browser, Toast.LENGTH_SHORT).show();
            }
        }
        return true;
    }

    // ---------------- 页面状态 ----------------

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        view.evaluateJavascript(INJECT_JS, null);
        listener.onPageLoaded();
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        super.onReceivedError(view, request, error);
        if (request.isForMainFrame()) {
            String detail = error.getDescription() == null ? "" : error.getDescription().toString();
            listener.onPageFailed(context.getString(R.string.load_failed, detail));
        }
    }

    @Override
    public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
        super.onReceivedHttpError(view, request, response);
        if (request.isForMainFrame() && response.getStatusCode() >= 400) {
            listener.onPageFailed(context.getString(R.string.load_failed,
                    "HTTP " + response.getStatusCode()));
        }
    }

    @Override
    public boolean onRenderProcessGone(WebView view, android.webkit.RenderProcessGoneDetail detail) {
        // WebView 渲染进程被系统回收：不崩溃，交给原生错误页提示重开
        listener.onPageFailed(context.getString(R.string.render_gone));
        return true;
    }

    @Override
    public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Log.i(TAG, "loading " + url);
        }
    }
}
