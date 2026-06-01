+++
title = "gcloud"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "gcloud CLI reference for auth, project management, compute, storage, IAM policy inspection, and service account enumeration."
tags = ["cloud", "gcp", "gcloud", "iam", "security"]
categories = ["cheatsheets"]
+++

## Authentication & Identity

```bash
gcloud auth login                               # browser-based login
gcloud auth activate-service-account \
  --key-file=key.json                           # authenticate as service account
gcloud auth list                                # list active accounts
gcloud config set account user@example.com      # switch active account
gcloud auth print-identity-token                # JWT identity token (for API calls)
gcloud auth print-access-token                  # OAuth access token
```

## Configuration & Projects

```bash
gcloud config list                              # current config
gcloud config set project my-project-id        # set active project
gcloud config set compute/region us-central1   # set default region
gcloud config set compute/zone us-central1-a   # set default zone

# Configurations (named profiles)
gcloud config configurations create dev
gcloud config configurations list
gcloud config configurations activate dev

# Projects
gcloud projects list
gcloud projects describe my-project-id
gcloud config get-value project                 # current project ID
```

## Compute (GCE)

```bash
# Instances
gcloud compute instances list
gcloud compute instances list --format="table(name,zone,status,networkInterfaces[0].accessConfigs[0].natIP)"
gcloud compute instances describe <instance> --zone <zone>

# Start/Stop
gcloud compute instances start <instance> --zone <zone>
gcloud compute instances stop <instance> --zone <zone>

# SSH access
gcloud compute ssh <instance> --zone <zone>
gcloud compute ssh <instance> --zone <zone> -- -L 8080:localhost:80  # with port forward
gcloud compute scp ./local-file <instance>:~/remote-file --zone <zone>

# Firewall rules (network security review)
gcloud compute firewall-rules list
gcloud compute firewall-rules describe <rule-name>

# Check for overly permissive rules
gcloud compute firewall-rules list \
  --format="table(name,direction,sourceRanges,allowed)" \
  --filter="sourceRanges=0.0.0.0/0"

# Instance metadata (from inside a VM)
curl "http://metadata.google.internal/computeMetadata/v1/?recursive=true" \
  -H "Metadata-Flavor: Google"

# Get service account token from metadata
curl "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" \
  -H "Metadata-Flavor: Google"
```

## Cloud Storage (GCS)

```bash
# Buckets
gcloud storage buckets list
gcloud storage buckets describe gs://my-bucket

# Objects
gcloud storage ls gs://my-bucket/
gcloud storage ls gs://my-bucket/ --recursive

# Transfer
gcloud storage cp ./file.txt gs://my-bucket/
gcloud storage cp gs://my-bucket/file.txt ./
gcloud storage rsync ./local-dir gs://my-bucket/remote-dir

# Bucket IAM policy (check for allUsers / allAuthenticatedUsers)
gcloud storage buckets get-iam-policy gs://my-bucket

# Object ACL
gcloud storage objects describe gs://my-bucket/file.txt
```

## IAM

```bash
# Project-level policy
gcloud projects get-iam-policy my-project-id

# Bindings for a specific member
gcloud projects get-iam-policy my-project-id \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:alice@example.com" \
  --format="table(bindings.role)"

# Grant a role
gcloud projects add-iam-policy-binding my-project-id \
  --member="user:alice@example.com" \
  --role="roles/viewer"

# Revoke a role
gcloud projects remove-iam-policy-binding my-project-id \
  --member="user:alice@example.com" \
  --role="roles/viewer"

# Custom roles
gcloud iam roles list --project my-project-id
gcloud iam roles describe roles/compute.viewer
```

## Service Accounts

```bash
# List service accounts
gcloud iam service-accounts list

# Describe
gcloud iam service-accounts describe sa-name@project.iam.gserviceaccount.com

# Keys (external key files — security risk)
gcloud iam service-accounts keys list \
  --iam-account=sa-name@project.iam.gserviceaccount.com

# Create / delete key
gcloud iam service-accounts keys create key.json \
  --iam-account=sa-name@project.iam.gserviceaccount.com
gcloud iam service-accounts keys delete <key-id> \
  --iam-account=sa-name@project.iam.gserviceaccount.com

# Impersonate a service account
gcloud --impersonate-service-account=sa@project.iam.gserviceaccount.com \
  projects list
```

## Kubernetes Engine (GKE)

```bash
gcloud container clusters list
gcloud container clusters describe <cluster> --zone <zone>

# Get credentials (populates kubeconfig)
gcloud container clusters get-credentials <cluster> --zone <zone>

# Check cluster security settings
gcloud container clusters describe <cluster> --zone <zone> \
  --format="yaml(masterAuth,networkConfig,privateClusterConfig,workloadIdentityConfig)"
```

## Logging

```bash
# Read logs
gcloud logging read "resource.type=gce_instance" --limit 50
gcloud logging read 'protoPayload.methodName="SetIamPolicy"' --limit 20
gcloud logging read 'severity>=ERROR' --freshness=1h

# List log sinks
gcloud logging sinks list

# Log-based metrics
gcloud logging metrics list
```
