+++
title = "Azure CLI"
date = 2026-07-21T00:00:00-04:00
draft = false
description = "Azure CLI (az) reference for authentication, subscriptions, Entra ID enumeration, RBAC, virtual machines, storage, networking, and Key Vault — useful for cloud operations and security assessments."
tags = ["cloud", "azure", "azure-cli", "entra-id", "security"]
categories = ["cheatsheets"]
+++

## Authentication & Identity

```bash
az login                                        # interactive browser login
az login --use-device-code                      # device-code flow (headless/SSH)
az login --tenant <tenant-id>                   # log in to a specific tenant

# Service principal login
az login --service-principal \
  --username <appId> \
  --password <client-secret> \
  --tenant <tenant-id>

# Managed identity (from inside an Azure VM/resource)
az login --identity

az account show                                 # who am I? (current subscription + user)
az account get-access-token                     # raw bearer token for the current context
az logout
```

## Subscriptions & Configuration

```bash
az account list --output table                  # all subscriptions I can see
az account list --query "[].{Name:name, ID:id, State:state}" -o table
az account set --subscription <sub-id-or-name>  # switch active subscription
az account tenant list                           # tenants I have access to

# Defaults so you can stop repeating --resource-group / --location
az configure --defaults group=my-rg location=eastus
az config get                                    # show current config
```

## Resource Groups

```bash
az group list --output table
az group show --name my-rg
az group create --name my-rg --location eastus
az group delete --name my-rg --yes --no-wait

# Everything in a resource group
az resource list --resource-group my-rg --output table
```

## Entra ID (Users, Groups, Apps)

```bash
# Users
az ad user list --output table
az ad user show --id alice@contoso.com
az ad user get-member-groups --id alice@contoso.com

# Groups
az ad group list --output table
az ad group show --group "Cloud Admins"
az ad group member list --group "Cloud Admins" --output table

# App registrations & service principals
az ad app list --output table
az ad app show --id <appId>
az ad sp list --all --output table
az ad sp show --id <appId>

# Credentials on an app (client secrets / certs — audit for stale creds)
az ad app credential list --id <appId>

# Who are the privileged directory roles?
az rest --method GET \
  --url "https://graph.microsoft.com/v1.0/directoryRoles"
```

## RBAC — Role Assignments

```bash
# What can this identity do, and where?
az role assignment list --assignee alice@contoso.com --all --output table
az role assignment list --scope /subscriptions/<sub-id> --output table

# All Owners/Contributors on the subscription (privilege audit)
az role assignment list \
  --scope /subscriptions/<sub-id> \
  --query "[?roleDefinitionName=='Owner'].{Who:principalName, Role:roleDefinitionName}" \
  -o table

# Assign / remove a role
az role assignment create \
  --assignee alice@contoso.com \
  --role "Reader" \
  --scope /subscriptions/<sub-id>/resourceGroups/my-rg
az role assignment delete --assignee alice@contoso.com --role "Reader"

# Role definitions (find custom roles and their allowed actions)
az role definition list --custom-role-only true --output table
az role definition list --name "Reader" --query "[].permissions"
```

## Virtual Machines

```bash
az vm list --output table
az vm list -d --query "[].{Name:name, IP:publicIps, State:powerState}" -o table
az vm show --resource-group my-rg --name my-vm
az vm show -g my-rg -n my-vm --show-details --query publicIps

# Power state
az vm start   --resource-group my-rg --name my-vm
az vm stop    --resource-group my-rg --name my-vm
az vm deallocate --resource-group my-rg --name my-vm   # stop billing for compute

# Run a command inside a VM (no SSH needed — logged in Activity Log)
az vm run-command invoke -g my-rg -n my-vm \
  --command-id RunShellScript --scripts "whoami && hostname"
```

## Storage Accounts

```bash
az storage account list --output table
az storage account show --name mystorage --resource-group my-rg

# Security posture — public access & TLS
az storage account show --name mystorage \
  --query "{Public:allowBlobPublicAccess, HTTPSOnly:enableHttpsTrafficOnly, TLS:minimumTlsVersion}"

# Account keys (sensitive — treat like passwords)
az storage account keys list --account-name mystorage --resource-group my-rg

# Containers & blobs (auth with a key or --auth-mode login)
az storage container list --account-name mystorage --auth-mode login -o table
az storage blob list --account-name mystorage \
  --container-name data --auth-mode login -o table

# Generate a time-boxed SAS token
az storage container generate-sas --account-name mystorage \
  --name data --permissions r --expiry 2026-12-31T00:00Z
```

## Networking (NSG)

```bash
az network nsg list --output table
az network nsg show --resource-group my-rg --name my-nsg

# Effective rules, ordered by priority (spot overly-permissive rules)
az network nsg rule list --resource-group my-rg --nsg-name my-nsg \
  --query "sort_by([], &priority)[].{Priority:priority, Name:name, Access:access, Port:destinationPortRange, Source:sourceAddressPrefix}" \
  -o table

# Add a deny rule
az network nsg rule create -g my-rg --nsg-name my-nsg \
  --name deny-rdp --priority 300 --access Deny --direction Inbound \
  --protocol Tcp --destination-port-ranges 3389 --source-address-prefixes '*'

# Public IPs across the subscription
az network public-ip list --query "[].{Name:name, IP:ipAddress}" -o table
```

## Key Vault

```bash
az keyvault list --output table
az keyvault show --name my-vault

# Access model & network exposure
az keyvault show --name my-vault \
  --query "{RBAC:properties.enableRbacAuthorization, Network:properties.networkAcls.defaultAction}"

# Secrets (names only — values require explicit read)
az keyvault secret list --vault-name my-vault --output table
az keyvault secret show --vault-name my-vault --name db-password --query value -o tsv

# Keys & certificates
az keyvault key list --vault-name my-vault --output table
az keyvault certificate list --vault-name my-vault --output table
```

## Activity Log & Monitoring

```bash
# Recent control-plane activity (who did what)
az monitor activity-log list --max-events 50 --output table
az monitor activity-log list \
  --caller alice@contoso.com \
  --start-time 2026-07-01T00:00:00Z \
  --query "[].{Time:eventTimestamp, Op:operationName.value, Status:status.value}" -o table

# Diagnostic settings (confirm logs are actually being exported)
az monitor diagnostic-settings list --resource <resource-id> --output table
```

## Useful Global Flags

```bash
--output table | json | jsonc | tsv | yaml       # output format (-o for short)
--query "<JMESPath>"                              # filter/shape output client-side
--subscription <id>                               # target a subscription per-command
--only-show-errors                                # quiet the warnings
az <group> <cmd> --help                           # built-in reference for any command
```
