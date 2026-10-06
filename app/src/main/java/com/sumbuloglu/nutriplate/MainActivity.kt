package com.sumbuloglu.nutriplate

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import java.io.ByteArrayInputStream

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private val localHost = "appassets.androidplatform.net"
    private val assetsAllowed = mapOf(
        "/assets/index.html" to "text/html",
        "/assets/app.js" to "application/javascript",
        "/assets/foods.json" to "application/json",
        "/assets/recipes.json" to "application/json"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.web_view)
        webView.settings.apply {
            javaScriptEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            setSupportMultipleWindows(false)
        }
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse {
                val uri = request.url
                val path = uri.path ?: ""
                val mime = assetsAllowed[path]
                if (uri.scheme == "https" && uri.host == localHost && mime != null) {
                    return try {
                        WebResourceResponse(mime, "UTF-8", assets.open(path.removePrefix("/assets/")))
                    } catch (_: Exception) { missing() }
                }
                return missing()
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.scheme == "https" && uri.host == localHost && uri.path == "/assets/index.html") return false
                if (request.isForMainFrame && uri.scheme == "https") {
                    try { startActivity(Intent(Intent.ACTION_VIEW, uri)) }
                    catch (_: ActivityNotFoundException) {
                        Toast.makeText(this@MainActivity, "No browser available", Toast.LENGTH_SHORT).show()
                    }
                }
                return true
            }
        }
        webView.loadUrl("https://$localHost/assets/index.html")
    }

    private fun missing() = WebResourceResponse(
        "text/plain", "UTF-8", 404, "Not Found", emptyMap<String, String>(),
        ByteArrayInputStream("Not found".toByteArray())
    )

    @Deprecated("Legacy back handling for the Activity")
    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
