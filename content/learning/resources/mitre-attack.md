+++
title = "MITRE ATT&CK"
date = 2026-07-24T00:00:00-04:00
draft = false
description = "A knowledge base of adversary tactics and techniques, and the shared vocabulary detection work is described in."
tags = ["reference", "free", "blue-team", "detection", "threat-intel", "framework"]
categories = ["resources"]
+++

## Overview

ATT&CK is a knowledge base of real-world adversary tactics, techniques, and procedures, organized into matrices per environment: Enterprise (including a dedicated cloud and identity section), Mobile, and ICS. Each technique page describes what the behavior looks like, which groups and malware families have used it, what data sources reveal it, and how to mitigate it.

Its primary value is as a shared vocabulary rather than as reading material. When a detection rule, a threat report, and a purple team exercise all reference T1078 (Valid Accounts), everyone is describing the same behavior. Microsoft Sentinel analytics rules and Defender alerts both carry ATT&CK mappings, so familiarity with the matrix speeds up cloud alert triage considerably.

The companion project **D3FEND** works in the opposite direction. It catalogs defensive countermeasures and maps them back to the offensive techniques they counter. D3FEND is less mature and less widely adopted, but useful for articulating why a specific control is worth its cost.

## How It's Used

- **Coverage mapping.** Teams select the techniques relevant to their environment (identity and cloud techniques first, in an Azure-centric estate) and mark which ones current tooling would actually detect. The gaps become a detection backlog.
- **Alert triage.** An alert carrying an ATT&CK tag comes with a page of context on what the adversary is likely to attempt next.
- **Reading threat intelligence.** Vendor reports map findings to ATT&CK technique IDs, which turns a narrative report into a set of concrete detection requirements.
- **Purple teaming.** Techniques give red and blue teams a common target list to exercise and measure against.

## Strengths & Limitations

The matrix is overwhelming on first contact, and attempting to learn it front to back is a common misstep. The more practical approach is to learn the fourteen tactics (the column headers) to understand the flow of an intrusion, then look up individual techniques on demand. It functions as a dictionary, not a textbook.

The other well-documented pitfall is coverage theater: treating the count of "covered" techniques as a security metric. Techniques are not equally weighted, and detecting one credential-access technique that real adversaries use against a given environment is worth more than nominal coverage of thirty that they don't.

ATT&CK also describes behavior, not remediation depth. It pairs best with prescriptive material: [hardening baselines](/learning/resources/cis-benchmarks/) for configuration, and a governance framework such as [NIST CSF](/learning/resources/nist-csf/) for program structure.

**Not the right fit if:** fundamentals are still in progress, meaning networking, operating systems, and how authentication works. ATT&CK assumes familiarity with concepts like Kerberos tickets and OAuth consent grants. [Security+](/learning/certifications/comptia-security-plus/) level knowledge is a reasonable prerequisite.

## Details

- **Type:** Reference framework / knowledge base
- **Cost:** Free
- **Skill Level:** Intermediate (assumes fundamentals)
- **Best for:** Detection engineering, alert triage, threat intelligence, purple teaming
- **Link:** [attack.mitre.org](https://attack.mitre.org/)
- **Companion:** [d3fend.mitre.org](https://d3fend.mitre.org/)
