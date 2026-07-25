+++
title = "The Practice of Network Security Monitoring"
date = 2026-07-24T00:00:00-04:00
draft = false
description = "Richard Bejtlich's case for detection over prevention, and a durable method for network-based intrusion analysis."
tags = ["book", "paid", "blue-team", "detection", "SOC", "incident-response", "intermediate"]
categories = ["resources"]
+++

## Overview

Bejtlich's central argument can be stated in a sentence: **prevention eventually fails, so a security team is measured by how quickly it detects and responds.** The rest of the book follows from that premise. It covers what network security monitoring is, what data to collect (full packet capture, session data, transaction logs, and alerts, with the tradeoffs between them), how to build a collection architecture, and how to run the analysis process during an intrusion.

The author's background is Air Force CERT and Mandiant, and the framing reflects it. The orientation is toward targeted intrusion response rather than compliance. The book works through server-side and client-side compromises end to end, including the step most training omits: determining when an incident is actually over.

## How It's Used

The material most often cited as durable:

- **The data types.** Understanding why session data scales better than full packet capture is the insight that makes log retention and cost decisions coherent.
- **The analysis workflow.** Escalating from alert to session to transaction to content is a repeatable method, and it maps onto pivoting through a modern SIEM such as Sentinel or Defender.
- **The intrusion case studies.** These are among the clearest published walkthroughs of how an experienced analyst reasons through evidence.

## Strengths & Limitations

The tooling is dated, and readers should expect that. The book builds on the Security Onion distribution of its era, and the specific commands and interfaces have since moved on. It is best read for method rather than syntax. Following along as though it were a current lab guide leads to debugging an old distribution instead of learning the material.

The method itself has aged well. Substituting a cloud-native SIEM for the on-premises one and cloud audit logs for the network tap leaves the analysis workflow essentially intact, which is a reasonable indicator of a book worth reading. The parts that expired were never the substance.

It is also a well-constructed technical book, which is less common than it should be. As a use of study time, it builds defensive capability in a way certification study guides generally do not.

**Not the right fit if:** reading a packet capture or explaining a TCP handshake is not yet comfortable, since the book assumes working network fundamentals. It is also aimed squarely at defense. For an application security or offensive focus, the [Web Application Hacker's Handbook](/learning/resources/web-application-hackers-handbook/) is the more relevant text.

## Details

- **Type:** Book (~380 pages)
- **Cost:** ~$50 print, ~$40 ebook
- **Skill Level:** Intermediate (assumes networking fundamentals)
- **Best for:** SOC analysts, detection engineers, practitioners moving into blue team work
- **Pair with:** [Blue Team Labs Online](/learning/platforms/blue-team-labs-online/) for hands-on application
- **Link:** [nostarch.com/nsm](https://nostarch.com/nsm)
