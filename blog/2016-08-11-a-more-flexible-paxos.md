---
slug: a-more-flexible-paxos
title: A More Flexible Paxos
authors: [sougou]
tags: [distributed-systems]
---

With systems getting more and more distributed, the Paxos algorithm has been gaining popularity. However, a major drawback with today's configurations is that you cannot run too many Paxos servers in a quorum. The sweet spot seems to be five servers. Those who run only three have to deal with the risk of downtime. Those who run seven or more have to face degraded write performance.

In short, it seems that you have to trade-off between uptime and write performance. However, it is possible to have both if we redefined the quorum rules, and this blog intends to show how.

<!--truncate-->

#### Disclaimer

*I've learnt about Paxos relatively recently. So, I could have misunderstood some things. Feel free to correct me if there are flaws.*

*The proposed variation looks fairly straightforward to me. Strangely, I haven't seen this discussed elsewhere. Also, if the idea is noteworthy, a formal proof will need to be worked on.*

## Paxos in very few words

The original [Paxos](http://research.microsoft.com/en-us/um/people/lamport/pubs/lamport-paxos.pdf) paper is hard to understand. The [RAFT](https://raft.github.io/raft.pdf) paper tries to make consensus algorithms more understandable. Here's how I would paraphrase Paxos:

Paxos is a three-step process:

1. Leader Election
2. Proposal Agreement
3. Proposal Finalization

### Leader Election

A server becomes a leader through an election process. If the majority of voters agree, it considers itself to be the leader.

### Proposal Agreement

The elected leader is responsible for getting agreement on a proposal. A follower will accept a proposal as long as it's not voted for a newer leader. If a majority of followers have agreed on a proposal, then it's final.

### Proposal Finalization

Once majority is reached, the leader communicates the proposal as final to all members.

### The honor code

For the above steps to work correctly, an important rule must be added: During the leader election process, the voters have to communicate previous proposals to the new leader. If so, the new leader's responsibility is to propagate the latest proposal it has seen from the voters. In this situation, the leader is not allowed to make an alternate proposal.

### Why it works

There are two critical rules that make this algorithm work:

1. The honor code gives us the assurance that a proposal will not be changed once it's accepted by the majority, because any new server that subsequently becomes a leader is guaranteed to see at least one follower with the latest proposal. So, it will be forced to propagate it.
2. If a new leader was elected before a proposal reached majority, the old leader will not succeed at getting its proposal through, because it will encounter at least one follower that has changed allegiance before majority is reached.

## Multi-Paxos

In real life, Paxos implementations do not perform all three steps for every proposal. Instead, they go with a leader lease. Once a leader is elected, then no other servers attempt to become a leader for an agreed period of time. Additionally, every time a proposal is successfully accepted, the lease is implicitly renewed.

This means that a server typically remains a leader for long periods of time, sometimes weeks. Leader election is basically a low QPS event. On the other hand, the proposal agreements and finalizations are high QPS.

This fact will be used to change the rules in our favor.

## Reinterpreting the rules

If we took a step back and re-evaluated the two 'why it works' rules, we can restate them more generally:

1. If a new leader is chosen after a proposal was successful, then it has to see it, and must honor it.
2. If a new leader is chosen before a proposal was successful, then the old leader must not succeed at that proposal.

We're specifically refraining from defining how a leader gets chosen, and how a proposal is deemed successful. Requiring the leader and the proposal to get a majority vote as described by Paxos is a specific way of achieving this. But this can be generalized as follows:

- If there are N servers in a quorum,
- if the number of voters required for a leader is L,
- if the number of voters required for a proposal is P,
- then, as long as L+P > N, the two rules are still preserved.

A similar concept was [previously used in Dynamo](http://www.allthingsdistributed.com/2008/12/eventually_consistent.html) for a simpler read vs. write quorum as R+W > N.

For standard Paxos, L and P are set to N/2+1, which makes (N/2+1)*2 > N. Instead, we can choose N and P such that P ≤ N, and L can be computed as N-P+1.

> An example:
> N=11
> L=9
> P=3

In the above case, 9 voters have to agree for a server to be a leader, but only 3 voters are needed for a proposal to be final. This system will have the performance of a 5-node paxos, but the uptime of 11 nodes.

The formula works for even values of N also. For example, if you had a 5-node cluster that you wanted to deploy in three zones, then the zone that has only one node becomes 'weaker' than the other two. This can now be overcome by setting N=6 (two nodes per zone) and preserving P at 3.

High values of N give us high uptime, while low values of P give us high write performance. The two parameters become independently tunable, and we can now get the best of both worlds.

## Caveat

If there is a total network partition, a standard Paxos system can still operate normally. But an additional node failure could cause the system to lock up.

With the new changes, a network partition could happen in such a way that a leader election may not be possible on any of the sides. Such a system will still make progress because the current leader will be able to reach the necessary number of acceptors. But if an additional failure triggers a leader election, the system will lock up.

So, in both cases, two simultaneous failures are needed for the system to lock up. Standard Paxos does have an additional flexibility: If a network partition is the only failure, it can still execute a successful leader change while the new system cannot.

If a double-failure were to happen, a human operator will have to intervene. The corrective action will be to subset the quorum to re-satisfy L+P>Nnew, and the system will resume. Once the network issue is resolved, the blackholed servers can be added back to the quorum.

There are probably situations where the system itself can perform this subsetting without losing data integrity. Solutions need to be brainstormed.

## Acknowlegements

I'd like to thank Anthony Yeh, Michael Berlin and Erez Louidor for reviewing this write-up.

Coincidentally, Howard, Malkhi and Spiegelman independently came up with the same idea, and have published a [formal paper that also proves correctness and safety](https://arxiv.org/abs/1608.06696).
