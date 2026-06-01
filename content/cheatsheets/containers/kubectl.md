+++
title = "kubectl"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "kubectl quick reference for pods, deployments, services, namespaces, RBAC auditing, and cluster resource inspection."
tags = ["containers", "kubernetes", "kubectl", "security", "devops"]
categories = ["cheatsheets"]
+++

## Context & Cluster

```bash
kubectl config get-contexts                     # list available contexts
kubectl config current-context                  # active context
kubectl config use-context <context>            # switch context
kubectl config set-context --current --namespace=dev  # set default namespace
kubectl cluster-info
kubectl version
```

## Namespaces

```bash
kubectl get namespaces
kubectl create namespace staging
kubectl delete namespace staging

# Run commands in a specific namespace
kubectl get pods -n kube-system
kubectl get all -n production

# All namespaces
kubectl get pods -A
kubectl get services -A
```

## Pods

```bash
kubectl get pods
kubectl get pods -o wide                        # include node, IP
kubectl get pods -o yaml                        # full YAML spec
kubectl describe pod <pod-name>                 # detailed info + events

kubectl logs <pod-name>                         # pod logs
kubectl logs <pod-name> -f                      # follow
kubectl logs <pod-name> --previous              # logs from crashed container
kubectl logs <pod-name> -c <container>          # multi-container pod

# Exec into running pod
kubectl exec -it <pod-name> -- bash
kubectl exec -it <pod-name> -c <container> -- sh

# Run one-off debug pod
kubectl run debug --rm -it --image=busybox -- sh
kubectl run debug --rm -it --image=alpine -- sh

# Delete
kubectl delete pod <pod-name>
kubectl delete pod <pod-name> --force --grace-period=0   # immediate
```

## Deployments

```bash
kubectl get deployments
kubectl describe deployment <name>

kubectl create deployment nginx --image=nginx
kubectl scale deployment nginx --replicas=3
kubectl set image deployment/nginx nginx=nginx:1.25

kubectl rollout status deployment/nginx         # watch rollout
kubectl rollout history deployment/nginx        # revision history
kubectl rollout undo deployment/nginx           # roll back to previous
kubectl rollout undo deployment/nginx --to-revision=2

kubectl delete deployment <name>
```

## Services

```bash
kubectl get services
kubectl describe service <name>
kubectl expose deployment nginx --port=80 --type=ClusterIP
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl expose deployment nginx --port=80 --type=LoadBalancer

# Port-forward for local testing
kubectl port-forward pod/<pod-name> 8080:80
kubectl port-forward service/<svc-name> 8080:80
```

## ConfigMaps & Secrets

```bash
kubectl get configmaps
kubectl get secrets

kubectl create configmap app-config --from-file=config.yaml
kubectl create configmap app-config --from-literal=KEY=value

# View secret (base64 encoded)
kubectl get secret <name> -o yaml
# Decode value
kubectl get secret <name> -o jsonpath='{.data.password}' | base64 -d
```

## RBAC Auditing

```bash
# Check what the current identity can do
kubectl auth can-i create pods
kubectl auth can-i '*' '*'                      # wildcard check
kubectl auth can-i create pods --namespace prod --as jane

# List roles and bindings
kubectl get roles -A
kubectl get rolebindings -A
kubectl get clusterroles
kubectl get clusterrolebindings

# Describe a role
kubectl describe clusterrole cluster-admin
kubectl describe rolebinding <name> -n <namespace>

# Who can do what (requires audit plugin or manual review)
kubectl get rolebindings -A -o yaml | grep -A5 "subjects"
```

## Resource Requests & Limits

```bash
# View resource usage
kubectl top pods
kubectl top nodes
kubectl top pods --sort-by=memory

# Check resource quotas in namespace
kubectl describe resourcequota -n <namespace>
kubectl describe limitrange -n <namespace>
```

## Useful Queries

```bash
# Pods not in Running state
kubectl get pods -A | grep -v Running

# Pods on a specific node
kubectl get pods -A --field-selector spec.nodeName=<node>

# Events (troubleshooting)
kubectl get events --sort-by='.lastTimestamp'
kubectl get events -n <namespace>

# All resources in namespace
kubectl get all -n <namespace>

# Get pod IP addresses
kubectl get pods -o custom-columns=NAME:.metadata.name,IP:.status.podIP

# List images running in cluster
kubectl get pods -A -o jsonpath='{range .items[*]}{.spec.containers[*].image}{"\n"}{end}' | sort -u

# Find pods with hostNetwork: true (potential security issue)
kubectl get pods -A -o jsonpath='{range .items[?(@.spec.hostNetwork==true)]}{.metadata.namespace}/{.metadata.name}{"\n"}{end}'

# Find privileged containers
kubectl get pods -A -o json | jq -r '
  .items[] |
  select(.spec.containers[].securityContext.privileged == true) |
  .metadata.namespace + "/" + .metadata.name'
```

## Copying Files

```bash
kubectl cp <pod-name>:/path/to/file ./local_copy
kubectl cp ./local_file <pod-name>:/path/in/pod
kubectl cp <namespace>/<pod-name>:/path ./local_copy
```
