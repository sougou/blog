---
slug: distributed-durability-in-mysql
title: Distributed Durability in MySQL
authors: [sougou]
tags: [database, distributed-systems]
---

This blog post proposes modifications to the MySQL semi-sync replication process in order to improve the overall consistency and resilience of the system.

*This is based on my previous blog post on Flexible Paxos and the related paper [Flexible Paxos: Quorum intersection revisited](https://arxiv.org/abs/1608.06696) by Howard, Malkhi and Spiegelman.*

<!--truncate-->

## Background

Durability requirements have changed over the last few years. Traditional systems considered their data Durable if it was written to disk. However, this is not acceptable any more. In today's world, data is considered durable only if it has been replicated to more than one machine.

MySQL is one of the few databases that has made an effort to satisfy this form of durability. It supported the ability to replicate data from a master to its replicas in near-realtime. But this ability did not address the failure mode where a master database experiences a network partition. If this happened, then commits would continue to succeed, but the data would fail to get replicated. An eventual loss of such a master would result in a data loss.

In order to address this problem, MySQL introduced semi-sync replication. This feature required that a transaction needed to be successfully sent to at least S (number of semi-sync acks) replicas before it was considered a success.

*There are many versions of semi-sync. For this particular blog, we're assuming the lossless version where the master waits for the acks before committing. Also, semi-sync needs to be configured with async fallback "disabled" (by setting the timeout to several decades, and enabling wait_no_slave).*

This approach has a few advantages:

- If the master database crashes, then we know that at least S other replicas have received all its committed transactions. So, one of them could be designated as the new master, and the system can resume without data loss.
- If the master database encountered a network partition, none of its transactions would succeed. If this happened, we can safely failover to another replica that is still able to connect to the rest of the cluster. We can then abandon the old master because we know it could not have progressed ahead of the replicas.
- The system can survive the failure of up to S nodes without loss of durability.

There are also a few drawbacks:

- If a master is only able to replicate to less than S replicas, then it won't be able to commit those transactions. In this case, the replicas themselves will be ahead of the master. Applications that read from those replicas will end up seeing future values (uncommitted reads).
- Extending the above story, the eventual failure of such replicas could lead to loss of replicated data that may not be recoverable (ghost reads).
- Semi-sync does not specify how the system should be repaired if faced with various failures. Without this specification, the story remains incomplete and open to the interpretations of the implementers, and they may not have thought through all possible scenarios. Tools like [Orchestrator](https://github.com/outbrain/orchestrator) have tried to close this gap, but the solutions are not perfect.

Let's do a quick analysis of the failure modes. They fall into two categories:

1. **Master failure:** This is the easy part. We figure out which replica is most up-to-date, we make that the master and point all the other replicas to it. Note that this is a paraphrase. The actual workflow will have many steps and verifications.
2. **Network partition:** If the master is unable to reach S nodes, then it will lock up. We then have to look for the most progressed replica on the other side of the partition and make that the master. However, the nodes that got left out might have already diverged. If so, they'll have to be rebuilt from scratch before they can join the quorum.

The network partition issue discourages the use of high values of S. Most systems tend to run with S=1.

Although not directly stated, this is basically a distributed consensus problem.

## The solution

To address the above failure modes, all we need to do is make semi-sync a two-step process:

- Send the data like before to the replicas and wait for S acks. However, the replicas do not commit those transactions yet.
- Once the necessary acks are received, send commit confirmations, which will inform the replicas that they can commit the data now.

If we work through the failure scenarios, it will be evident that this change will address the previously described problems. But then, there's an easier way, which is described below.

### Proof

The change essentially makes the algorithm match the formal steps required by a consensus protocol like Paxos. To be more precise, it follows the requirements of the new FPaxos generalization. Once we're convinced that we comply, we can rely on the existing proofs and guarantees to gain confidence.

In my previous post about Flexible Paxos, I've listed three steps:

1. Leader election
2. Proposal Agreement
3. Proposal Finalization

Semi-sync replication is a combination of steps 2 & 3. The only difference is that replicas that receive a proposal automatically treat it as final. With the new change, replicas have to wait till they receive a finalization message. This change, along with the master waiting for the required number of acks before sending the commit message, will make this Paxos compliant.

Traditional Paxos requires majority agreement for steps 1 and 2. However, the new [FPaxos generalization](https://arxiv.org/abs/1608.06696) shows that any kind of overlap between the two steps is sufficient. The L+P>N formula gives you that guarantee. In our case, P=S+1 (sem-sync replicas+master).

The failover process is the other side of the coin. We need to show that such a process honors the fundamentals of the leader election process (step 1). A tool like Orchestrator finds the most progressed replica, designates it as the master and points all the other replicas to it. Once all the replicas are repointed, the failover is complete. Comparing these steps with Paxos:

- The act of finding the most progressed replica amounts to honoring the proposal(s) of the last leader.
- The act of pointing a replica to the new master is equivalent to gaining a vote from that replica. If sufficient number of replicas have been repointed to the new master, then the old master will never be able to get the necessary acks to succeed. This allows the new master to start accepting traffic.

In other words, [Orchestrator](https://github.com/outbrain/orchestrator) just needs to reach L nodes to consider the failover process successful, where L=N-S.

## Performance considerations

The main concern with the proposed change is that the new scheme costs two round trips instead of one. Let's look at how to optimize this:

- The steps up to the point where the master gets the acks and commits don't really change. So, there's no added cost there. The new system's commit performance remains unaffected.
- After the commit is done, the confirmation needs to be sent. However, it's lightweight. For high QPS systems, this message can actually be piggy-bagged with the next transaction.
- On the replica side, they are allowed to proactively replay the transaction. They just shouldn't commit until the confirmation is received.

## The details

The intent of this blog is to only present the basic idea and its feasibility. A consensus algorithm requires additional details to be worked out. For example, it's possible that replicas contain diverged uncommitted transactions. Fortunately, Paxos has rules about how to resolve these conflicts. We just need to apply them in the new context.
