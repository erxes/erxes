-------------------------------- MODULE Jobs --------------------------------
(***************************************************************************)
(* One core_jobs row from the enqueueing transaction to done (deleted) or  *)
(* dead, with workers that claim, run, crash, time out, fail and retry.    *)
(* Paths are relative to apps/core-api/src/modules/jobs. Each action is    *)
(* one SQL statement, one handler run, or a commit.                        *)
(*                                                                         *)
(* Time is abstract. A claim's lease is "running" until Expire ends it.    *)
(* Every claim on one queue gets the same lease length (jobs.ts:150-157),  *)
(* so leases end in the order they were taken: Expire ends the oldest.     *)
(* run_at and backoff only delay a claim, so a queued job is due at once.  *)
(*                                                                         *)
(* Left out: the atomic handler's transaction (a non-atomic handler with   *)
(* an external effect is the weaker case), dedupe keys (enqueueJob's       *)
(* onConflictDoNothing, jobs.ts:60, adds no row), the onDead hook's own    *)
(* effects, organisation deletion (cascade), and several jobs.            *)
(***************************************************************************)
EXTENDS Naturals, FiniteSets

CONSTANTS
  Workers,      \* processes running processJobs (jobs.ts:263-291)
  MaxAttempts,  \* core_jobs.max_attempts at enqueue
  MaxRetries,   \* times someone presses retry on a dead job
  Broken        \* deliberately broken designs, for the .broken-*.cfg checks

VARIABLES
  tx,           \* the enqueueing transaction: "open", "committed", "rolledback"
  status,       \* core_jobs.status, "done" once deleted, "none" if never committed
  attempts,     \* core_jobs.attempts
  maxAttempts,  \* core_jobs.max_attempts
  lockedBy,     \* the claim whose locked_until is on the row (0 = null)
  leases,       \* claims whose lease time has not run out
  pc,           \* where each worker is
  claimNo,      \* the attempts value each worker's claim returned (its job row)
  effects,      \* times the handler's effect happened
  retries       \* retryDeadJobs calls so far

vars == <<tx, status, attempts, maxAttempts, lockedBy, leases, pc, claimNo, effects, retries>>

Min(S) == CHOOSE n \in S : \A m \in S : n <= m

Has(b) == b \in Broken

TypeOK ==
  /\ tx \in {"open", "committed", "rolledback"}
  /\ status \in {"none", "queued", "running", "dead", "done"}
  /\ attempts \in Nat
  /\ maxAttempts \in Nat
  /\ lockedBy \in Nat
  /\ leases \subseteq Nat
  /\ pc \in [Workers -> {"idle", "claimed", "succeeded", "failed"}]
  /\ claimNo \in [Workers -> Nat]
  /\ effects \in Nat
  /\ retries \in 0..MaxRetries

\* enqueueJob (jobs.ts:48-64) inserted the row; its transaction is still open.
Init ==
  /\ tx = "open"
  /\ status = "queued"
  /\ attempts = 0
  /\ maxAttempts = MaxAttempts
  /\ lockedBy = 0
  /\ leases = {}
  /\ pc = [w \in Workers |-> "idle"]
  /\ claimNo = [w \in Workers |-> 0]
  /\ effects = 0
  /\ retries = 0

\* Other transactions see the row only after commit. The broken design
\* enqueues on its own connection instead of the caller's transaction.
Visible == tx = "committed" \/ Has("enqueue_outside_tx")

Commit ==
  /\ tx = "open"
  /\ tx' = "committed"
  /\ UNCHANGED <<status, attempts, maxAttempts, lockedBy, leases, pc, claimNo, effects, retries>>

Rollback ==
  /\ tx = "open"
  /\ tx' = "rolledback"
  /\ status' = IF Has("enqueue_outside_tx") THEN status ELSE "none"
  /\ UNCHANGED <<attempts, maxAttempts, lockedBy, leases, pc, claimNo, effects, retries>>

\* `locked_until < now()` on a running row. A null locked_until never is.
LeaseRanOut == status = "running" /\ lockedBy # 0 /\ lockedBy \notin leases

\* Time passes beyond the oldest lease.
Expire ==
  /\ leases # {}
  /\ leases' = leases \ {Min(leases)}
  /\ UNCHANGED <<tx, status, attempts, maxAttempts, lockedBy, pc, claimNo, effects, retries>>

\* The claim statement (jobs.ts:147-167): one update over
\* `select ... for update skip locked`, so two workers never take one row.
\* It takes a due queued job, or a running one whose lease ran out and that
\* has attempts left; the abandon statement just before it (jobs.ts:139-145)
\* made the others dead.
Claimable ==
  /\ Visible
  /\ \/ status = "queued"
     \/ /\ LeaseRanOut
        /\ ~Has("no_reclaim")
        /\ attempts < maxAttempts \/ Has("reclaim_past_max")

Claim(w) ==
  /\ pc[w] = "idle"
  /\ Claimable
  /\ status' = "running"
  /\ attempts' = attempts + 1
  /\ lockedBy' = attempts + 1
  /\ leases' = leases \cup {attempts + 1}
  /\ pc' = [pc EXCEPT ![w] = "claimed"]
  /\ claimNo' = [claimNo EXCEPT ![w] = attempts + 1]
  /\ UNCHANGED <<tx, maxAttempts, effects, retries>>

\* The abandon statement (jobs.ts:139-145): a job whose worker stopped during
\* its last attempt is dead; processJobs runs its onDead (jobs.ts:270-276).
Abandon ==
  /\ ~Has("reclaim_past_max") /\ ~Has("no_reclaim")
  /\ Visible
  /\ LeaseRanOut
  /\ attempts >= maxAttempts
  /\ status' = "dead"
  /\ lockedBy' = 0
  /\ UNCHANGED <<tx, attempts, maxAttempts, leases, pc, claimNo, effects, retries>>

\* definition.handle(job) (jobs.ts:254): its effect happens, or it throws.
Run(w) ==
  /\ pc[w] = "claimed"
  /\ \/ effects' = effects + 1 /\ pc' = [pc EXCEPT ![w] = "succeeded"]
     \/ UNCHANGED effects /\ pc' = [pc EXCEPT ![w] = "failed"]
  /\ UNCHANGED <<tx, status, attempts, maxAttempts, lockedBy, leases, claimNo, retries>>

\* The worker process dies anywhere after its claim. Its lease runs on.
Crash(w) ==
  /\ pc[w] # "idle"
  /\ pc' = [pc EXCEPT ![w] = "idle"]
  /\ UNCHANGED <<tx, status, attempts, maxAttempts, lockedBy, leases, claimNo, effects, retries>>

\* heldBy (jobs.ts:200-201): the row is running under this worker's claim.
\* The broken design matches on the id only (and on status = 'running' in
\* fail), the way jobs.ts did before the fence.
HeldBy(w) == status = "running" /\ attempts = claimNo[w]

\* The delete after a successful run (jobs.ts:255). The broken design
\* `ack_before_run` deletes the job first and runs it after.
Ack(w) ==
  /\ \/ pc[w] = "succeeded"
     \/ pc[w] = "claimed" /\ Has("ack_before_run")
  /\ IF HeldBy(w) \/ (Has("unfenced") /\ status \in {"queued", "running", "dead"})
       THEN status' = "done" /\ lockedBy' = 0
       ELSE UNCHANGED <<status, lockedBy>>
  /\ pc' = [pc EXCEPT ![w] = "idle"]
  /\ UNCHANGED <<tx, attempts, maxAttempts, leases, claimNo, effects, retries>>

\* fail (jobs.ts:203-231): back to queued, or dead after the last attempt,
\* judged by the worker's own job row (claimNo).
Fail(w) ==
  /\ pc[w] = "failed"
  /\ IF HeldBy(w) \/ (Has("unfenced") /\ status = "running")
       THEN /\ status' = IF claimNo[w] >= maxAttempts THEN "dead" ELSE "queued"
            /\ lockedBy' = 0
       ELSE UNCHANGED <<status, lockedBy>>
  /\ pc' = [pc EXCEPT ![w] = "idle"]
  /\ UNCHANGED <<tx, attempts, maxAttempts, leases, claimNo, effects, retries>>

\* retryDeadJobs (jobs.ts:336-355): one more attempt for a dead job.
Retry ==
  /\ status = "dead"
  /\ retries < MaxRetries
  /\ status' = "queued"
  /\ maxAttempts' = attempts + 1
  /\ retries' = retries + 1
  /\ UNCHANGED <<tx, attempts, lockedBy, leases, pc, claimNo, effects>>

Next ==
  \/ Commit \/ Rollback \/ Expire \/ Abandon \/ Retry
  \/ \E w \in Workers : Claim(w) \/ Run(w) \/ Crash(w) \/ Ack(w) \/ Fail(w)

\* Workers keep polling and handlers return; crashes and retries may not happen.
Fairness ==
  /\ WF_vars(Commit \/ Rollback)
  /\ WF_vars(Expire)
  /\ WF_vars(Abandon)
  /\ \A w \in Workers : WF_vars(Claim(w)) /\ WF_vars(Run(w)) /\ WF_vars(Ack(w)) /\ WF_vars(Fail(w))

Spec == Init /\ [][Next]_vars /\ Fairness

\* Keeps the broken reclaim_past_max design finite. It never binds on the real
\* design, where AttemptsBounded holds.
Bounded == attempts <= MaxAttempts + MaxRetries + 1

(***************************************************************************)
(* Properties                                                              *)
(***************************************************************************)

\* Enqueue in the transaction: a job whose transaction rolled back never
\* existed, and nothing runs before the commit.
EnqueueFollowsTransaction ==
  /\ tx # "committed" => effects = 0
  /\ tx = "rolledback" => status = "none"

\* Never lost after commit: the row exists until it is done, and it is only
\* done once its effect happened.
NeverLost ==
  /\ tx = "committed" => status # "none"
  /\ status = "done" => effects >= 1

\* Never run by two workers at once while the lease holds: two workers that
\* both still hold the job never both have time left on their leases.
LeaseExclusive ==
  \A v, w \in Workers :
    (v # w /\ pc[v] # "idle" /\ pc[w] # "idle") => ~(claimNo[v] \in leases /\ claimNo[w] \in leases)

\* Attempts never exceed the maximum.
AttemptsBounded == attempts <= maxAttempts

\* Finished jobs stay finished: done is final, and dead only goes back to
\* the queue through retryDeadJobs.
FinishedStaysFinished ==
  [][/\ status = "done" => status' = "done"
     /\ (status = "dead" /\ status' # "dead") => (status' = "queued" /\ retries' = retries + 1)]_vars

\* At-least-once delivery: a committed job's effect happens, or it ends dead.
AtLeastOnce == tx = "committed" ~> (effects >= 1 \/ status = "dead")
=============================================================================
