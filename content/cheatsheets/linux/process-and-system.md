+++
title = "Process & System Auditing"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "Process inspection, open files, network sockets, logs, and scheduled tasks — essential for incident response and system auditing."
tags = ["linux", "processes", "incident-response", "auditing"]
categories = ["cheatsheets"]
+++

## Process Inspection

```bash
ps aux                          # all processes, BSD format
ps aux | grep <name>            # find specific process
ps -ef --forest                 # tree view of process hierarchy
pstree -p                       # ASCII process tree with PIDs

top                             # interactive process viewer
htop                            # improved interactive viewer (if installed)

# Process details
ls -la /proc/<PID>/exe          # binary path for running process
cat /proc/<PID>/cmdline | tr '\0' ' '  # full command line
cat /proc/<PID>/environ | tr '\0' '\n' # environment variables
ls -la /proc/<PID>/fd           # open file descriptors
```

## Open Files & Sockets

```bash
lsof -i                         # all network connections
lsof -i :443                    # what's listening on port 443
lsof -i TCP:80                  # TCP connections on port 80
lsof -p <PID>                   # all files open by process
lsof -u username                # all files open by user
lsof +D /tmp                    # who has files open in /tmp

# Modern alternative
ss -tlnp                        # TCP listening sockets with PID
ss -tulnp                       # TCP+UDP listening with PID
ss -anp | grep <PID>            # all sockets for a process
netstat -tlnp                   # classic — TCP listening with PID
```

## Network State

```bash
ip addr show                    # interface addresses
ip route show                   # routing table
ip neigh show                   # ARP table
cat /etc/hosts                  # local DNS overrides
cat /etc/resolv.conf            # DNS resolver config

# Connections to external IPs
ss -tnp | grep ESTAB            # established TCP connections
```

## Logs & Journal

```bash
journalctl -xe                              # recent logs with context
journalctl -u sshd                          # logs for a specific unit
journalctl --since "1 hour ago"             # time-bounded query
journalctl --since "2026-05-30 12:00:00"
journalctl -p err -b                        # errors since last boot
journalctl -f                               # follow (tail) live

# Traditional log files
tail -f /var/log/syslog          # live syslog
tail -f /var/log/auth.log        # auth events (Debian/Ubuntu)
grep "Failed password" /var/log/auth.log    # SSH failures
grep "Accepted publickey" /var/log/auth.log # successful SSH logins
last                             # login history
lastb                            # failed login attempts
lastlog                          # last login per user
who                              # currently logged in users
w                                # who and what they're doing
```

## Scheduled Tasks

```bash
crontab -l                      # current user's crontab
crontab -l -u root              # root's crontab (requires sudo)
cat /etc/crontab                # system crontab
ls /etc/cron.d/                 # cron drop-in directory
ls /etc/cron.{hourly,daily,weekly,monthly}/

# At jobs
atq                             # list pending at jobs
at -c <job_id>                  # show job commands
```

## Systemd Services

```bash
systemctl list-units --type=service         # all running services
systemctl list-units --type=service --all   # all services (including inactive)
systemctl status <service>                  # service status
systemctl is-enabled <service>             # does it start at boot?
systemctl list-timers                      # scheduled systemd timers
```

## Kernel & OS Info

```bash
uname -a                        # kernel version and arch
cat /etc/os-release             # distro info
hostnamectl                     # hostname, OS, kernel summary
uptime                          # uptime and load average
dmesg | tail -50                # recent kernel messages
lsmod                           # loaded kernel modules
```

## Users & Groups

```bash
cat /etc/passwd                 # user accounts
cat /etc/shadow                 # password hashes (root only)
cat /etc/group                  # group definitions
id <username>                   # UID, GID, supplemental groups
getent passwd <username>        # LDAP/NIS-aware user lookup
sudo -l                         # current user's sudo privileges
cat /etc/sudoers                # sudoers config (root only)
ls /etc/sudoers.d/              # sudoers drop-ins
```
