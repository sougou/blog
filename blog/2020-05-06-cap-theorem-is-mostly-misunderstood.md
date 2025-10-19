---
slug: cap-theorem-is-mostly-misunderstood
title: CAP theorem is mostly misunderstood
authors: [sougou]
tags: [distributed-systems, database]
---

I have always been a big fan of the CAP theorem and its corollary PACELC. There are so many articles that talk about these theorems. However, they often end up making misdirected claims by categorizing systems one way or another.

After much googling, I was not able to find a single article that clearly explained how these rules should be applied in real life. So, here is a way to make it easy for a layperson:

<!--truncate-->

## CAP Recap

CAP is actually well explained by most write-ups, and the [wikipedia](https://en.wikipedia.org/wiki/CAP_theorem) is a good starting point. The one-sentence explanation is: if a system is distributed, you can expect operations on it to be either consistent or available, but not both.

The PACELC corollary is essentially the CAP theorem, where Latency replaces Availability.

*The CAP theorem can also be evolved by replacing Consistency with Durability, if a system chooses to achieve Durability by writing to multiple nodes. But this is another topic.*

The reason why the theorem gets misunderstood is because people try to categorize systems as CA, CP or AP.

*In reality, the theorem must be applied per-operation. A system is capable of exhibiting all of the above properties, just not at the same time.*

This is why it's incorrect to categorize a system into a corner of the CAP triangle.

## Vitess as Example

Since I work with [Vitess](http://vitess.io/), I'll explain how it can satisfy all the above categories. However, the rules can be extended to any distributed system.

### CA

CA means that you want data to be Consistent and Available. This means that you have to forego partition tolerance. The way achieve this is to co-locate your app with the master databases. You can then read and write to the master nodes and enjoy the CA benefits.

*Variation (suggested by [Dahlia Malkhi](https://dahliamalkhi.wordpress.com/))*

CA can also be achieved by using intersecting quorums. This is natural for systems that use consensus algorithms like Paxos or Raft. In the case of Vitess, this is achieved through automated master fail-overs followed by optional fail-over of app server traffic.

### CP

CP means that you want consistent data at all costs. If there is a network partition, you'd rather wait. Obviously, everyone will prefer CA over CP. But one chooses CP only because they want the app to be distributed in multiple locations.

*Variation 1*

Send all reads to the master database no matter where you are. If there is a network partition, a read will not be possible until you can talk to the master again.

*Variation 2*

Wait for the master to replicate the latest data to a replica before performing a local read. In such cases, the read can be held up waiting for replication to be up-to-date. Note: this is currently not supported in Vitess.

*Variation 3*

Make the writes wait till the data is copied to all relevant replicas. This will cause writes to be slow, or hang if there is a partition. Vitess semi-sync replication falls in this category. However, semi-sync is meant more for achieving Durability rather than Consistency.

In all the above schemes, a network partition will cause the system to stall. And in the absence of a network partition, the system will still be subject to the cost of round-trip latency across data centers.

### AP

AP means that you can tolerate stale data. To achieve this, you can provision replicas in all places where the apps are, and just read from them. If there is a partition, the reads will still be successful and quick, but the data will be stale.

### AP-CP Trade-off

There are ways to trade-off between AP and CP. For example, you can say that you'll tolerate staleness up to X seconds. Operations will be AP as long as the lag is within limits. If it becomes too high, the operation becomes CP, and refuses to serve the data until replication is caught up.

In Vitess, this trade-off is achieved with two values: The `discovery_low_replication_lag` duration asks vitess to disregard replicas that are lagging by longer than this specified value, unless all of them are lagged, in which case, vitess will serve the queries anyway. The `discovery_high_replication_lag_minimum_serving` duration has a higher value and tells vitess to unconditionally disregard replicas that are lagging beyond this amount.

## Behavior of Systems

Some systems may prefer CP over CA, or vice-versa. Some of them may also choose to give you only one. However, it's always possible for any system to make a decision to support all modes of operation.

In this light, the better way to evaluate a system is to ask which of its operations are CA and which are CP.

CA is either an end-user choice achieved by deciding to co-locate the app with the master nodes, or an operational decision based on how quorums are configured or failovers managed.
