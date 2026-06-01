+++
title = "Docker"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "Docker image and container management, volumes, networks, log inspection, security hardening flags, and compose essentials."
tags = ["containers", "docker", "security", "devops"]
categories = ["cheatsheets"]
+++

## Images

```bash
docker images                           # list local images
docker pull nginx:latest                # pull from registry
docker build -t myapp:1.0 .             # build from Dockerfile
docker build -t myapp:1.0 -f alt.Dockerfile .
docker tag myapp:1.0 registry/myapp:1.0 # tag for push
docker push registry/myapp:1.0          # push to registry
docker rmi myapp:1.0                    # remove image
docker image prune                      # remove dangling images
docker image prune -a                   # remove all unused images

# Inspect image layers
docker history myapp:1.0
docker inspect myapp:1.0
```

## Containers: Run

```bash
docker run nginx                                # run (foreground)
docker run -d nginx                             # detached (background)
docker run -it ubuntu:22.04 bash               # interactive + TTY
docker run --rm alpine echo "hello"            # auto-remove on exit
docker run -d --name webserver nginx
docker run -d -p 8080:80 nginx                 # host:container port mapping
docker run -d -p 127.0.0.1:8080:80 nginx       # bind only to localhost

# Environment variables
docker run -e "DB_HOST=localhost" -e "DB_PASS=secret" myapp

# Resource limits
docker run --memory="512m" --cpus="1.5" myapp
```

## Containers: Manage

```bash
docker ps                       # running containers
docker ps -a                    # all containers (including stopped)
docker stop <container>
docker start <container>
docker restart <container>
docker rm <container>           # remove stopped container
docker rm -f <container>        # force remove running container
docker container prune          # remove all stopped containers

# Execute commands
docker exec -it <container> bash        # interactive shell
docker exec <container> cat /etc/passwd # run single command
docker exec -u root <container> bash    # exec as root
```

## Logs & Inspection

```bash
docker logs <container>                     # all logs
docker logs -f <container>                  # follow (tail)
docker logs --tail 100 <container>          # last 100 lines
docker logs --since 1h <container>          # logs from last hour

docker inspect <container>                  # full JSON details
docker inspect <container> | jq '.[0].NetworkSettings'
docker stats                                # live resource usage
docker top <container>                      # processes inside container
docker diff <container>                     # filesystem changes since start
```

## Volumes

```bash
docker volume create mydata
docker volume ls
docker volume inspect mydata
docker volume rm mydata
docker volume prune

# Mount in run
docker run -v mydata:/app/data myapp               # named volume
docker run -v /host/path:/container/path myapp     # bind mount
docker run -v /host/path:/container/path:ro myapp  # read-only bind
```

## Networks

```bash
docker network ls
docker network create mynet
docker network inspect mynet
docker network connect mynet <container>
docker network disconnect mynet <container>

# Run on specific network
docker run --network mynet myapp

# Isolated — no external network access
docker run --network none myapp
```

## Security Hardening Flags

```bash
# Drop all capabilities and add only what's needed
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx

# Read-only root filesystem
docker run --read-only nginx

# Prevent privilege escalation (no setuid binaries)
docker run --security-opt no-new-privileges myapp

# Run as non-root user
docker run -u 1000:1000 myapp
docker run --user nobody myapp

# Limit resources to prevent DoS
docker run --memory="256m" --memory-swap="256m" --cpus="0.5" myapp

# Seccomp profile (restrict syscalls)
docker run --security-opt seccomp=/path/to/profile.json myapp

# Disable inter-container communication
docker network create --icc=false isolated_net
```

## Scanning for Secrets

```bash
# Inspect image environment variables
docker inspect <image> | jq '.[0].Config.Env'

# Inspect running container env
docker exec <container> env

# Check image layers for sensitive data
docker history --no-trunc <image>

# Extract image filesystem for analysis
docker save <image> -o image.tar && tar -xf image.tar
```

## Docker Compose

```bash
docker compose up -d            # start services (detached)
docker compose down             # stop and remove containers
docker compose down -v          # also remove volumes
docker compose ps               # list service containers
docker compose logs -f          # follow all service logs
docker compose logs -f service  # specific service
docker compose exec service bash # shell into service
docker compose build            # rebuild images
docker compose pull             # pull latest images
```

### Minimal Hardened Compose Service

```yaml
services:
  app:
    image: myapp:1.0
    user: "1000:1000"
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    mem_limit: 256m
    cpus: 0.5
    networks:
      - internal
    tmpfs:
      - /tmp
```
