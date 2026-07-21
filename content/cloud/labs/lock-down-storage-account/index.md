+++
title = "Lock Down a Storage Account End-to-End"
date = 2026-07-20T22:00:00-04:00
draft = false
description = "Walk a storage account from public-by-default to private-endpoint-only, proving each network state live: firewall rules, a private endpoint, and split-horizon DNS observed directly."
tags = ["azure", "storage", "private-endpoint", "firewall", "sc-500"]
categories = ["labs"]
aliases = ["/writeups/labs/lock-down-storage-account/"]
+++

Part of my SC-500 study series: hands-on labs in a test tenant, one concept at a time.

**Goal:** Walk a storage account from "public by default" to "private-endpoint only," proving each state transition live rather than just reading about it.

## Why this matters

A storage account's exposure is controlled by two independent layers: network (firewall rules, private endpoints) and auth (keys, SAS, Entra RBAC). This lab isolates the network layer: each step below narrows *where* the account can be reached from, while auth stays constant, so you can see exactly which layer rejects each blocked request.

## Prerequisites

- A storage account, a small VNet with one subnet, and a test VM inside it (the "inside" observer)
- A blob container to test against

## Step 1 - Provision and seed test data

Create the storage account, VNet, subnet, and test VM:

![Creating the storage account](01-provision-storage-account.png)
![Creating the VNet](02-provision-vnet.png)
![Configuring the subnet](03-provision-subnet.png)
![Creating the test VM inside the subnet](04-provision-vm.png)

Create a blob container named `storagelab`:

![Creating the storagelab blob container](05-create-blob-container.png)

Upload a test file into it:

![Uploading a test file into the container](06-upload-test-file.png)

## Step 2 - Baseline: confirm public access works

From your laptop, confirm the blob endpoint answers publicly:

```bash
nslookup mystorage.blob.core.windows.net
```

![nslookup resolving to the public endpoint](07-nslookup-public.png)

`nslookup` resolves to the public endpoint. Then check access via CLI, logged in as an account with the right permissions:

![CLI listing the container contents as a baseline](08-cli-access-baseline.png)

## Step 3 - Firewall rules: deny by default, allow one IP

Set the storage firewall's default action to **Deny**, and add an IP rule scoped to your own public IP only:

![Setting the storage firewall default action to Deny](09-firewall-deny-default.png)
![Adding an IP allow rule for my own public IP](10-firewall-allow-ip.png)

From your own computer the public endpoint still resolves and works: your IP is allowed. Log into the test VM and try the same request with `curl`:

![curl from the test VM blocked by the firewall](11-vm-curl-blocked.png)

As expected, the request is blocked. The VM's outbound path isn't in the allow-list, even though it's "inside" Azure.

## Step 4 - Allow trusted Microsoft services

Enabled the *Allow trusted Microsoft services* exception (not screenshotted). This is what keeps things like Azure Backup and Defender working after the firewall locks down, without opening the account to the public internet generally.

## Step 5 - Add a private endpoint

Create a private endpoint for the `blob` sub-resource into the VNet's subnet, letting the portal create and link the `privatelink.blob.core.windows.net` private DNS zone automatically:

![Private endpoint basics tab](12-private-endpoint-basics.png)
![Selecting the blob sub-resource](13-private-endpoint-resource.png)
![Placing the private endpoint into the VNet subnet](14-private-endpoint-vnet.png)
![Linking the private DNS zone automatically](15-private-endpoint-dns.png)

## Step 6 - The money observation: split-horizon DNS, live

From the test VM, `nslookup mystorage.blob.core.windows.net` now returns the **private IP**:

![VM nslookup resolving to the private IP](16-vm-nslookup-private.png)

From the laptop, the same command still resolves to the public path:

![Laptop nslookup still resolving to the public path](17-laptop-nslookup-public.png)

Same hostname, two different answers depending on which network asked: split-horizon DNS observed directly rather than taken on faith from the docs.

## Step 7 - Full lockdown: disable public access entirely

Set **public network access = Disabled**:

![Disabling public network access](18-disable-public-access.png)
![Public network access now disabled](19-public-access-disabled.png)

The laptop can no longer list the container at all: public access is gone. The VM, reaching the account through its private IP, is unaffected.

## Step 8 - Re-open a public path for the next lab

Re-enabled public access from selected networks (just my IP) to leave a public path available for [Generate and Use a Scoped SAS Token]({{< ref "generate-scoped-sas-token" >}}), which needs one.

## Key takeaways

- Network rules and auth are independent layers. This lab held auth constant and only moved the network dial, which is why the VM's failures and the laptop's failures were both clean "network layer" rejections, not auth errors.
- A private endpoint doesn't just add a path, it changes what a hostname *resolves to*, and only for clients inside the linked VNet. That's the split-horizon behavior in Step 6.
- Locking `defaultAction=Deny` breaks anything not explicitly allowed, including your own Azure-side resources (the test VM) unless they're on an allowed path. Worth remembering before doing this against something in production.
- Full lockdown (`public network access = Disabled`) is a strictly stronger state than firewall rules with `Deny` plus an IP allow-list: it removes the public endpoint's reachability outright, not just gates it.

## Related labs

- [Generate and Use a Scoped SAS Token]({{< ref "generate-scoped-sas-token" >}}) reuses this environment
- Azure SQL Database Hardening applies the same network-lockdown pattern to a different data service
