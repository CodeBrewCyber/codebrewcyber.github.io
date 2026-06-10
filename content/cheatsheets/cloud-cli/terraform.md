+++
title = "Terraform"
date = 2026-06-10T00:00:00-04:00
draft = false
description = "Terraform quick-reference for core workflow, AWS provider setup, remote state, workspaces, import, and debugging — focused on AWS deployments."
tags = ["terraform", "iac", "aws", "cloud", "infrastructure"]
categories = ["cheatsheets"]
+++

## Core Workflow

```bash
terraform init                      # initialize working directory, download providers
terraform init -upgrade             # upgrade providers to latest allowed versions
terraform validate                  # check config syntax/consistency
terraform fmt                       # auto-format .tf files
terraform fmt -recursive            # format all subdirectories too

terraform plan                      # preview changes
terraform plan -out=tfplan          # save plan to file
terraform apply                     # apply changes (prompts for confirmation)
terraform apply tfplan              # apply a saved plan (no prompt)
terraform apply -auto-approve       # skip confirmation prompt

terraform destroy                   # destroy all managed resources
terraform destroy -auto-approve     # skip confirmation prompt
```

## AWS Provider & S3 Backend

```hcl
# versions.tf
terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state in S3 with DynamoDB locking
  backend "s3" {
    bucket         = "my-tf-state-bucket"
    key            = "envs/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

# provider.tf
provider "aws" {
  region  = "us-east-1"
  profile = "prod"          # optional: named AWS CLI profile
}
```

```bash
# Bootstrap the S3 backend (run once, before adding the backend block)
aws s3api create-bucket --bucket my-tf-state-bucket --region us-east-1
aws s3api put-bucket-versioning \
  --bucket my-tf-state-bucket \
  --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption \
  --bucket my-tf-state-bucket \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## State

```bash
terraform state list                            # list all resources in state
terraform state show aws_instance.web           # inspect a specific resource
terraform state mv aws_instance.old aws_instance.new   # rename/move resource in state
terraform state rm aws_instance.web             # remove resource from state (doesn't destroy it)

terraform taint aws_instance.web                # mark resource for replacement on next apply
terraform untaint aws_instance.web              # undo taint

terraform refresh                               # sync state with real infrastructure
terraform show                                  # human-readable view of current state
terraform show tfplan                           # inspect a saved plan file
terraform output                                # print all outputs
terraform output instance_ip                    # print a specific output value
```

## Variables & Outputs

```hcl
# variables.tf
variable "env" {
  type        = string
  description = "Deployment environment"
  default     = "dev"
}

variable "instance_type" {
  type = string
}

# outputs.tf
output "instance_ip" {
  value = aws_instance.web.public_ip
}
```

```bash
# Pass variables at the command line
terraform apply -var="env=prod" -var="instance_type=t3.micro"

# Use a variable file
terraform apply -var-file="prod.tfvars"

# terraform.tfvars is loaded automatically if present
cat terraform.tfvars
# env           = "prod"
# instance_type = "t3.micro"

# Interactive console for expression testing
terraform console
> var.env
> aws_instance.web.public_ip
```

## Workspaces

```bash
terraform workspace list            # list all workspaces (* marks current)
terraform workspace new staging     # create and switch to a new workspace
terraform workspace select prod     # switch to an existing workspace
terraform workspace show            # print current workspace name
terraform workspace delete staging  # delete a workspace (must not be current)
```

```hcl
# Reference workspace name in config
resource "aws_s3_bucket" "state" {
  bucket = "my-app-${terraform.workspace}"
}
```

## Import Existing Resources

```bash
# Import an existing AWS resource into state
terraform import aws_instance.web i-0123456789abcdef0
terraform import aws_s3_bucket.logs my-existing-bucket
terraform import aws_security_group.sg sg-0123456789abcdef0

# After import, write the matching resource block in .tf files
# then run plan to confirm zero diff
terraform plan
```

## Modules

```hcl
# Call a module from the Terraform Registry
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"
}

# Call a local module
module "ec2" {
  source = "./modules/ec2"

  instance_type = var.instance_type
  subnet_id     = module.vpc.public_subnets[0]
}
```

```bash
terraform get               # download/update modules
terraform init              # also downloads modules on first run
```

## Targeting & Partial Apply

```bash
# Apply or destroy only specific resources
terraform apply -target=aws_instance.web
terraform apply -target=module.vpc
terraform destroy -target=aws_security_group.sg

# Replace a specific resource (replaces taint in Terraform 0.15+)
terraform apply -replace=aws_instance.web
```

## Debugging

```bash
# Log levels: TRACE, DEBUG, INFO, WARN, ERROR
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform.log
terraform apply

# JSON-formatted plan (useful for CI/scripting)
terraform plan -out=tfplan
terraform show -json tfplan | jq '.resource_changes[] | select(.change.actions[] | contains("create"))'

# Check provider version in use
terraform version
terraform providers
```
