+++
title = "nmap"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "Quick reference for nmap host discovery, port scans, version and OS detection, NSE scripts, output formats, and evasion flags."
tags = ["networking", "nmap", "recon", "scanning"]
categories = ["cheatsheets"]
+++

## Host Discovery

```bash
nmap -sn 192.168.1.0/24         # ping sweep — no port scan
nmap -sn -PS22,80,443 <range>   # TCP SYN ping to specific ports
nmap -sn -PA80 <range>          # TCP ACK ping (bypass some firewalls)
nmap -sL <range>                # list targets — no scanning
```

## Port Scanning

```bash
nmap <target>                   # default: top 1000 TCP ports (SYN scan as root)
nmap -p 22,80,443 <target>      # specific ports
nmap -p 1-65535 <target>        # full port range
nmap -p- <target>               # shorthand for all 65535 ports
nmap -F <target>                # fast — top 100 ports
nmap -sU -p 53,161 <target>     # UDP scan (slower, requires root)

# Scan types
nmap -sS <target>               # SYN scan (default, stealth)
nmap -sT <target>               # TCP connect scan (no root needed)
nmap -sA <target>               # ACK scan (firewall mapping)
nmap -sN <target>               # NULL scan (no flags)
nmap -sF <target>               # FIN scan
nmap -sX <target>               # Xmas scan (FIN+PSH+URG)
```

## Version & OS Detection

```bash
nmap -sV <target>               # service version detection
nmap -sV --version-intensity 9  # aggressive version detection
nmap -O <target>                # OS fingerprinting (root)
nmap -A <target>                # -sV + -O + scripts + traceroute
```

## NSE Scripts

```bash
nmap --script=<script> <target>
nmap --script=default <target>                  # same as -sC
nmap -sC <target>                               # default scripts

# Common script categories
nmap --script=vuln <target>                     # known CVEs/vulnerabilities
nmap --script=safe <target>                     # safe information gathering
nmap --script=discovery <target>                # service discovery

# Specific scripts
nmap --script=http-title <target>               # page titles
nmap --script=http-headers <target>             # response headers
nmap --script=ssl-cert <target>                 # TLS cert info
nmap --script=smb-vuln-ms17-010 <target>        # EternalBlue check
nmap --script=ftp-anon <target>                 # anonymous FTP
nmap --script=ssh-hostkey <target>              # SSH host keys
nmap --script=dns-zone-transfer --script-args dns-srv=<dns-ip> <target>

# Script with arguments
nmap --script=http-brute --script-args userdb=/path/to/users.txt,passdb=/path/to/pass.txt <target>
```

## Output Formats

```bash
nmap -oN output.txt <target>    # normal text
nmap -oX output.xml <target>    # XML (parseable)
nmap -oG output.gnmap <target>  # grepable
nmap -oA output <target>        # all three formats (output.{nmap,xml,gnmap})

# Parsing grepable output
grep "open" output.gnmap
grep "22/open" output.gnmap
```

## Timing & Performance

```bash
nmap -T0 <target>   # paranoid — very slow, IDS evasion
nmap -T1 <target>   # sneaky
nmap -T2 <target>   # polite
nmap -T3 <target>   # normal (default)
nmap -T4 <target>   # aggressive — faster, more noise
nmap -T5 <target>   # insane — fastest, may miss results

nmap --min-rate 1000 <target>   # send at least 1000 packets/sec
nmap --max-retries 1 <target>   # reduce retries for speed
```

## Firewall Evasion

```bash
nmap -f <target>                        # fragment packets
nmap --mtu 24 <target>                  # custom MTU (must be multiple of 8)
nmap -D RND:10 <target>                 # decoy scan with 10 random decoys
nmap -D 10.0.0.1,10.0.0.2,ME <target>  # specific decoy IPs
nmap -S <spoofed-IP> -e eth0 <target>   # spoof source IP
nmap --source-port 53 <target>          # use trusted source port
nmap --scan-delay 500ms <target>        # delay between probes
nmap --badsum <target>                  # bad TCP/UDP checksums (test IDS)
```

## Practical Examples

```bash
# Quick external recon
nmap -sV -sC -p 80,443,8080,8443 <target>

# Full internal host scan
nmap -sV -O -p- --min-rate 5000 -oA full_scan <target>

# Ping sweep then port scan top 1000
nmap -sn 192.168.1.0/24 -oG live_hosts.gnmap && \
  grep "Up" live_hosts.gnmap | awk '{print $2}' > live.txt && \
  nmap -iL live.txt -sV -oA port_scan
```
