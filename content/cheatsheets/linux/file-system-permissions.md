+++
title = "File System & Permissions"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "Linux file system navigation, permission management, and security-relevant flags like SUID, SGID, and sticky bit."
tags = ["linux", "permissions", "filesystem", "hardening"]
categories = ["cheatsheets"]
+++

## Listing & Navigation

```bash
ls -la                          # long listing with hidden files
ls -lh                          # human-readable sizes
ls -lt                          # sort by modification time (newest first)
tree -L 2                       # directory tree, 2 levels deep
pwd                             # print working directory
```

## Finding Files

```bash
find / -name "*.conf" 2>/dev/null           # find by name, suppress errors
find /etc -type f -newer /etc/passwd        # files newer than passwd
find / -size +100M                          # files over 100MB
find / -empty                               # empty files and directories

# Security-relevant finds
find / -perm -4000 2>/dev/null              # find SUID files
find / -perm -2000 2>/dev/null              # find SGID files
find / -perm -0002 2>/dev/null              # world-writable files
find / -nouser -o -nogroup 2>/dev/null      # orphaned files (no owner)
find / -perm -4000 -type f -exec ls -la {} \;  # SUID with details
```

## Disk Usage

```bash
df -h                           # disk free, human-readable
du -sh /var/log                 # directory size summary
du -sh * | sort -rh | head -20  # top 20 largest items in cwd
```

## Permissions

```bash
chmod 755 file          # rwxr-xr-x
chmod 644 file          # rw-r--r--
chmod +x script.sh      # add execute for all
chmod -R 700 dir/       # recursive, owner-only

chown user:group file   # change owner and group
chown -R user:group dir/

# Octal reference
# 4 = read, 2 = write, 1 = execute
# 7 = rwx, 6 = rw-, 5 = r-x, 4 = r--
```

## Special Permission Bits

```bash
# SUID — file runs as file owner, not caller
chmod u+s /path/to/binary
# Example: /usr/bin/passwd is SUID root — ls shows 's' in owner execute bit

# SGID — file runs as group; directory: new files inherit group
chmod g+s /path/to/dir

# Sticky bit — only owner can delete files in a directory
chmod +t /tmp
# Example: /tmp is sticky — ls shows 't' in other execute bit

# Check special bits
ls -la /usr/bin/passwd    # -rwsr-xr-x (SUID)
ls -la /tmp               # drwxrwxrwt (sticky)

# Remove SUID/SGID
chmod u-s binary
chmod g-s directory
```

## Symbolic Links

```bash
ln -s /path/to/target linkname      # create symlink
ln /path/to/target hardlinkname     # create hard link
readlink -f linkname                # resolve symlink chain
```

## File Attributes (ext4)

```bash
lsattr file             # list extended attributes
chattr +i file          # immutable — cannot be modified or deleted
chattr -i file          # remove immutable flag
chattr +a file          # append-only
```

## Access Control Lists

```bash
getfacl file                            # view ACL
setfacl -m u:username:rwx file          # grant user rwx
setfacl -m g:groupname:rx file          # grant group rx
setfacl -x u:username file              # remove user ACL entry
setfacl -b file                         # remove all ACL entries
```
