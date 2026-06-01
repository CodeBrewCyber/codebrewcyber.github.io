+++
title = "curl & HTTP"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "curl command reference for HTTP methods, headers, authentication, file uploads, TLS options, and proxying traffic through Burp Suite."
tags = ["web", "curl", "http", "testing"]
categories = ["cheatsheets"]
+++

## Basic Requests

```bash
curl https://example.com                    # GET
curl -o output.html https://example.com     # save response to file
curl -O https://example.com/file.zip        # save with remote filename
curl -I https://example.com                 # HEAD request (headers only)
curl -v https://example.com                 # verbose — show request + response headers
curl -s https://example.com                 # silent (no progress)
curl -L https://example.com                 # follow redirects
curl -L --max-redirs 5 https://example.com  # follow up to 5 redirects
```

## HTTP Methods

```bash
curl -X GET https://api.example.com/users
curl -X POST https://api.example.com/users
curl -X PUT https://api.example.com/users/1
curl -X PATCH https://api.example.com/users/1
curl -X DELETE https://api.example.com/users/1
curl -X OPTIONS https://api.example.com/    # check allowed methods
```

## Request Headers

```bash
curl -H "Content-Type: application/json" https://example.com
curl -H "Accept: application/json" https://example.com
curl -H "X-Custom-Header: value" https://example.com

# Multiple headers
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     https://api.example.com/resource
```

## POST Data

```bash
# Form data (application/x-www-form-urlencoded)
curl -d "username=admin&password=secret" https://example.com/login
curl --data-urlencode "query=hello world" https://example.com/search

# JSON body
curl -X POST https://api.example.com/users \
     -H "Content-Type: application/json" \
     -d '{"name": "Alice", "role": "admin"}'

# From file
curl -X POST https://api.example.com/upload \
     -H "Content-Type: application/json" \
     -d @payload.json
```

## Authentication

```bash
# Basic auth
curl -u username:password https://example.com
curl -H "Authorization: Basic $(echo -n 'user:pass' | base64)" https://example.com

# Bearer token
curl -H "Authorization: Bearer eyJhbGci..." https://api.example.com

# API key in header
curl -H "X-API-Key: your-api-key" https://api.example.com

# API key in query string
curl "https://api.example.com/data?api_key=your-key"

# Cookie auth
curl -b "session=abc123" https://example.com
curl -b cookies.txt https://example.com    # load cookies from file
curl -c cookies.txt https://example.com    # save cookies to file
```

## File Upload (Multipart)

```bash
curl -F "file=@/path/to/file.pdf" https://example.com/upload
curl -F "file=@report.pdf;type=application/pdf" \
     -F "name=quarterly-report" \
     https://example.com/upload
```

## TLS / SSL Options

```bash
curl -k https://self-signed.example.com        # skip cert verification
curl --cacert /path/to/ca.crt https://example.com
curl --cert client.crt --key client.key https://example.com  # mutual TLS
curl --tlsv1.2 https://example.com             # force TLS version
curl --ciphers 'ECDHE-RSA-AES256-GCM-SHA384' https://example.com
```

## Proxying Through Burp Suite

```bash
# Route traffic through Burp (default listener 127.0.0.1:8080)
curl -x http://127.0.0.1:8080 https://example.com -k

# Set proxy via environment variable
export http_proxy=http://127.0.0.1:8080
export https_proxy=http://127.0.0.1:8080

# With auth
curl -x http://user:pass@proxy.example.com:3128 https://target.com
```

## Useful Combinations

```bash
# Check redirect chain
curl -Ls -o /dev/null -w "%{url_effective}" https://short.url/abc

# Time a request
curl -o /dev/null -s -w "time_total: %{time_total}s\n" https://example.com

# Extract specific response header
curl -sI https://example.com | grep -i "content-security-policy"

# Download only if newer than local file
curl -z local_file.html -o local_file.html https://example.com/page.html

# Rate-limited download
curl --limit-rate 1M -O https://example.com/large-file.zip

# POST with Referer and User-Agent spoofing
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
     -e "https://google.com" \
     https://target.com
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 301 | Moved Permanently |
| 302 | Found (Temporary Redirect) |
| 400 | Bad Request |
| 401 | Unauthorized (auth required) |
| 403 | Forbidden (auth present, denied) |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 502 | Bad Gateway |
| 503 | Service Unavailable |
