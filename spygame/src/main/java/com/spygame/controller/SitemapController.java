package com.spygame.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SitemapController {
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap(HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName()
                + portSegment(request);

        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                  <url>
                    <loc>%s/</loc>
                  </url>
                </urlset>
                """.formatted(baseUrl);
    }

    private String portSegment(HttpServletRequest request) {
        int port = request.getServerPort();
        boolean defaultHttp = "http".equalsIgnoreCase(request.getScheme()) && port == 80;
        boolean defaultHttps = "https".equalsIgnoreCase(request.getScheme()) && port == 443;
        if (defaultHttp || defaultHttps) {
            return "";
        }
        return ":" + port;
    }
}
