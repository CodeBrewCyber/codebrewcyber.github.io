+++
title = "AWS CLI"
date = 2026-05-31T00:00:00-04:00
draft = false
description = "AWS CLI reference for identity verification, IAM enumeration, S3, EC2, Lambda, CloudTrail, and STS role assumption — useful for cloud operations and security assessments."
tags = ["cloud", "aws", "aws-cli", "iam", "security"]
categories = ["cheatsheets"]
+++

## Identity & Authentication

```bash
aws sts get-caller-identity                     # who am I? (Account, ARN, UserId)
aws configure                                   # set up credentials interactively
aws configure list                              # show active config
aws configure list-profiles                     # list named profiles

# Use a specific profile
aws --profile prod s3 ls
export AWS_PROFILE=prod
```

## STS — Assume Role

```bash
# Assume a role
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/MyRole \
  --role-session-name my-session

# Use the returned credentials (bash)
export AWS_ACCESS_KEY_ID=<AccessKeyId>
export AWS_SECRET_ACCESS_KEY=<SecretAccessKey>
export AWS_SESSION_TOKEN=<SessionToken>

# Verify the assumed role
aws sts get-caller-identity
```

## IAM Enumeration

```bash
# Users
aws iam list-users
aws iam get-user --user-name alice
aws iam list-access-keys --user-name alice
aws iam list-groups-for-user --user-name alice
aws iam list-attached-user-policies --user-name alice
aws iam list-user-policies --user-name alice

# Groups
aws iam list-groups
aws iam get-group --group-name Admins
aws iam list-attached-group-policies --group-name Admins

# Roles
aws iam list-roles
aws iam get-role --role-name MyRole
aws iam list-attached-role-policies --role-name MyRole
aws iam list-role-policies --role-name MyRole

# Policies
aws iam list-policies --scope Local          # customer-managed only
aws iam get-policy --policy-arn arn:aws:iam::123456789012:policy/MyPolicy
aws iam get-policy-version \
  --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \
  --version-id v1

# Who has admin access?
aws iam list-attached-user-policies --user-name alice | grep AdministratorAccess
aws iam list-entities-for-policy --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

## S3

```bash
# Buckets
aws s3 ls                                       # list all buckets
aws s3 ls s3://my-bucket/                       # list bucket contents
aws s3 ls s3://my-bucket/prefix/ --recursive    # recursive listing

# Transfer
aws s3 cp file.txt s3://my-bucket/path/
aws s3 cp s3://my-bucket/file.txt ./
aws s3 sync ./local-dir s3://my-bucket/remote-dir/
aws s3 sync s3://my-bucket/remote-dir/ ./local-dir/

# Management
aws s3 mb s3://new-bucket
aws s3 rb s3://empty-bucket
aws s3 rm s3://my-bucket/file.txt
aws s3 rm s3://my-bucket/ --recursive           # delete all objects

# Security — check public access block
aws s3api get-public-access-block --bucket my-bucket

# Check bucket ACL
aws s3api get-bucket-acl --bucket my-bucket

# Check bucket policy
aws s3api get-bucket-policy --bucket my-bucket
```

## EC2

```bash
# Instances
aws ec2 describe-instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,PrivateIpAddress,Tags]' --output table
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running"

# Start/Stop/Terminate
aws ec2 start-instances --instance-ids i-0123456789abcdef0
aws ec2 stop-instances --instance-ids i-0123456789abcdef0
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0

# Security Groups
aws ec2 describe-security-groups
aws ec2 describe-security-groups --group-ids sg-0123456789abcdef0

# Key Pairs
aws ec2 describe-key-pairs

# Snapshots (check for public snapshots)
aws ec2 describe-snapshots --owner-ids self
aws ec2 describe-snapshots --owner-ids self \
  --filters "Name=snapshot-id,Values=snap-*" \
  --query 'Snapshots[?StartTime>`2024-01-01`]'
```

## Lambda

```bash
aws lambda list-functions
aws lambda get-function --function-name MyFunction
aws lambda get-function-configuration --function-name MyFunction

# Invoke
aws lambda invoke --function-name MyFunction \
  --payload '{"key":"value"}' \
  --cli-binary-format raw-in-base64-out \
  output.json && cat output.json

# List function URLs (unauthenticated endpoints)
aws lambda list-function-url-configs --function-name MyFunction

# Environment variables (may contain secrets)
aws lambda get-function-configuration --function-name MyFunction \
  --query 'Environment.Variables'
```

## CloudTrail

```bash
# List trails
aws cloudtrail describe-trails

# Check if logging is enabled
aws cloudtrail get-trail-status --name MyTrail

# Look up events (last 90 days via API)
aws cloudtrail lookup-events --max-results 50
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=Username,AttributeValue=alice
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole \
  --start-time "2026-05-01T00:00:00Z"
```

## CloudWatch Logs

```bash
aws logs describe-log-groups
aws logs describe-log-streams --log-group-name /aws/lambda/MyFunction
aws logs get-log-events \
  --log-group-name /aws/lambda/MyFunction \
  --log-stream-name "2026/05/31/[$LATEST]abc123"

# Tail logs
aws logs tail /aws/lambda/MyFunction --follow
```
