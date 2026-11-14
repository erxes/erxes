---------------------------- MODULE FileLifecycle ----------------------------
(***************************************************************************)
(* One core_files row from a started upload to its purge, against object   *)
(* storage, with concurrent completions, client PUTs, the prune, delete,   *)
(* purge and download. Paths are relative to apps/api/src/modules/    *)
(* files. Each action is one atomic step of the implementation: one SQL    *)
(* statement, one storage call, or a commit.                               *)
(*                                                                         *)
(* Storage holds two keys. "upload" is the upload link's key               *)
(* (files.service.ts:40-41, a fresh nonce per createUpload); "final" is    *)
(* the file's own key (files.service.ts:44-48), which no link can write.   *)
(* A stored object is the version number of the PUT that wrote it; 0 means *)
(* nothing is stored.                                                      *)
(*                                                                         *)
(* Both drivers are explored (driver is picked in Init):                   *)
(*  - s3: a PUT replaces the upload object; promote copies only the version*)
(*    stat saw (CopySourceIfMatch, storage.ts:328-339).                    *)
(*  - local: the link writes once (hard link, files.http.ts:67-72);        *)
(*    promote hard-links and never replaces the target (storage.ts:225-235)*)
(*                                                                         *)
(* Left out: storeServerFile (ready at once, no link), the size-mismatch   *)
(* branch of completeUpload (both drivers refuse a body of another length, *)
(* files.http.ts:53-64 and storage.ts:290-299), audit rows, several files, *)
(* and time (any pending row counts as old enough for the prune).          *)
(***************************************************************************)
EXTENDS Naturals

CONSTANTS
  Completers,  \* concurrent POST /files/:id/complete requests
  MaxPuts,     \* PUTs the client sends to its upload link
  Broken       \* deliberately broken designs, for the .broken-*.cfg checks

Keys == {"upload", "final"}
Busy == {"locked", "statted", "copied", "dropped"}

VARIABLES
  driver,   \* "local" or "s3"
  row,      \* core_files.status, or "gone" once purged
  rowKey,   \* core_files.key
  store,    \* key -> stored version (0 = nothing)
  puts,     \* PUTs sent so far; the next one writes version puts + 1
  lock,     \* the completion holding the row lock (FOR UPDATE), or "none"
  pc,       \* where each completion is
  seen,     \* the version each completion's stat saw
  checked,  \* the version the ready row was checked as
  rpc,      \* removeFile, only used by the remove_bytes_first design
  ppc,      \* purgeDeletedFiles
  pkey,     \* the key purge read from a deleting row
  served    \* versions handed to a reader through a download link

vars == <<driver, row, rowKey, store, puts, lock, pc, seen, checked, rpc, ppc, pkey, served>>

TypeOK ==
  /\ driver \in {"local", "s3"}
  /\ row \in {"pending", "ready", "deleting", "gone"}
  /\ rowKey \in Keys
  /\ store \in [Keys -> 0..MaxPuts]
  /\ puts \in 0..MaxPuts
  /\ lock \in Completers \cup {"none"}
  /\ pc \in [Completers -> {"idle"} \cup Busy]
  /\ seen \in [Completers -> 0..MaxPuts]
  /\ checked \in 0..MaxPuts
  /\ rpc \in {"idle", "bytesGone"}
  /\ ppc \in {"idle", "read", "removed"}
  /\ pkey \in Keys
  /\ served \subseteq 0..MaxPuts

\* After createUpload (files.service.ts:54-99): a pending row on the upload key.
Init ==
  /\ driver \in {"local", "s3"}
  /\ row = "pending"
  /\ rowKey = "upload"
  /\ store = [k \in Keys |-> 0]
  /\ puts = 0
  /\ lock = "none"
  /\ pc = [c \in Completers |-> "idle"]
  /\ seen = [c \in Completers |-> 0]
  /\ checked = 0
  /\ rpc = "idle"
  /\ ppc = "idle"
  /\ pkey = "upload"
  /\ served = {}

Release(c) == /\ lock' = "none"
              /\ pc' = [pc EXCEPT ![c] = "idle"]

\* The client PUTs to its link (files.http.ts:23-92 local; S3 presigned PUT).
Put ==
  /\ puts < MaxPuts
  /\ driver = "s3" \/ store["upload"] = 0
  /\ store' = [store EXCEPT !["upload"] = puts + 1]
  /\ puts' = puts + 1
  /\ UNCHANGED <<driver, row, rowKey, lock, pc, seen, checked, rpc, ppc, pkey, served>>

(***************************************************************************)
(* completeUpload (files.service.ts:124-182), one transaction that holds   *)
(* the row lock from lockRows until commit or rollback.                    *)
(***************************************************************************)

\* lockRows + findFile (125-127). Waits while another completion holds the
\* lock. Only a pending row goes on: a ready one is returned as it is (133-135)
\* and a deleting or purged one is "not found" (129-131), neither changes state.
CLock(c) ==
  /\ pc[c] = "idle"
  /\ lock = "none"
  /\ row = "pending"
  /\ lock' = c
  /\ pc' = [pc EXCEPT ![c] = "locked"]
  /\ UNCHANGED <<driver, row, rowKey, store, puts, seen, checked, rpc, ppc, pkey, served>>

\* storage().stat(row.key) (137); nothing there is 409 UPLOAD_INCOMPLETE (139-141).
CStat(c) ==
  /\ pc[c] = "locked"
  /\ IF store[rowKey] = 0
       THEN Release(c) /\ UNCHANGED seen
       ELSE /\ seen' = [seen EXCEPT ![c] = store[rowKey]]
            /\ pc' = [pc EXCEPT ![c] = "statted"]
            /\ UNCHANGED lock
  /\ UNCHANGED <<driver, row, rowKey, store, puts, checked, rpc, ppc, pkey, served>>

\* The first half of storage().promote (155): S3 CopyObject with
\* CopySourceIfMatch (storage.ts:329-337), local link() (storage.ts:226-233).
\* A refusal is 409 UPLOAD_CHANGED (156-162) and rolls back.
CopyOk(c) ==
  /\ store["upload"] # 0
  /\ (driver = "s3" /\ "promote_any_version" \notin Broken) => store["upload"] = seen[c]
  /\ driver = "local" => store["final"] = 0

CCopy(c) ==
  /\ pc[c] = "statted"
  /\ IF CopyOk(c)
       THEN /\ store' = [store EXCEPT !["final"] = store["upload"]]
            /\ pc' = [pc EXCEPT ![c] = "copied"]
            /\ UNCHANGED lock
       ELSE Release(c) /\ UNCHANGED store
  /\ UNCHANGED <<driver, row, rowKey, puts, seen, checked, rpc, ppc, pkey, served>>

\* The second half of promote: DeleteObject on the upload key (storage.ts:338)
\* or unlink (storage.ts:234).
CDrop(c) ==
  /\ pc[c] = "copied"
  /\ store' = [store EXCEPT !["upload"] = 0]
  /\ pc' = [pc EXCEPT ![c] = "dropped"]
  /\ UNCHANGED <<driver, row, rowKey, puts, lock, seen, checked, rpc, ppc, pkey, served>>

\* update ... set status 'ready', key finalKey where status = 'pending', the
\* audit row, commit (164-180).
CCommit(c) ==
  /\ pc[c] = "dropped"
  /\ row' = "ready"
  /\ rowKey' = "final"
  /\ checked' = seen[c]
  /\ Release(c)
  /\ UNCHANGED <<driver, store, puts, seen, rpc, ppc, pkey, served>>

\* The transaction rolls back at any point: a crash, a lost connection, a
\* failed audit insert. Storage changes already made stay.
CAbort(c) ==
  /\ pc[c] \in Busy
  /\ Release(c)
  /\ UNCHANGED <<driver, row, rowKey, store, puts, seen, checked, rpc, ppc, pkey, served>>

(***************************************************************************)
(* Cleanup and deletion                                                    *)
(***************************************************************************)

\* pruneUploads (321-333): one update over `select ... for update skip locked`,
\* so a row a completion has locked is skipped.
Prune ==
  /\ row = "pending"
  /\ lock = "none" \/ "prune_ignores_lock" \in Broken
  /\ row' = "deleting"
  /\ UNCHANGED <<driver, rowKey, store, puts, lock, pc, seen, checked, rpc, ppc, pkey, served>>

\* Broken design only: removeFile deletes the bytes first and marks the row
\* after, and can stop in between (guardDeletions throws, the process dies).
RemoveBytes ==
  /\ "remove_bytes_first" \in Broken
  /\ rpc = "idle"
  /\ lock = "none"
  /\ row \in {"pending", "ready"}
  /\ store' = [store EXCEPT ![rowKey] = 0]
  /\ rpc' = "bytesGone"
  /\ UNCHANGED <<driver, row, rowKey, puts, lock, pc, seen, checked, ppc, pkey, served>>

RemoveStops ==
  /\ rpc = "bytesGone"
  /\ rpc' = "idle"
  /\ UNCHANGED <<driver, row, rowKey, store, puts, lock, pc, seen, checked, ppc, pkey, served>>

\* removeFile's claim (254-258): one update `status <> 'deleting'`. An update
\* waits for a row lock, so it runs after a completion commits or rolls back.
RemoveClaim ==
  /\ rpc = "bytesGone" \/ "remove_bytes_first" \notin Broken
  /\ lock = "none"
  /\ row \in {"pending", "ready"}
  /\ row' = "deleting"
  /\ rpc' = "idle"
  /\ UNCHANGED <<driver, rowKey, store, puts, lock, pc, seen, checked, ppc, pkey, served>>

\* purgeDeletedFiles (279-314): read deleting rows' keys in one scope (280-291),
\* remove the bytes outside any scope (295-302), a storage failure keeps the
\* tombstone for the next run (299-301), then delete rows still deleting (306-311).
PurgeRead ==
  /\ ppc = "idle"
  /\ row = "deleting"
  /\ pkey' = rowKey
  /\ ppc' = "read"
  /\ UNCHANGED <<driver, row, rowKey, store, puts, lock, pc, seen, checked, rpc, served>>

PurgeRemove ==
  /\ ppc = "read"
  /\ store' = [store EXCEPT ![pkey] = 0]
  /\ ppc' = "removed"
  /\ UNCHANGED <<driver, row, rowKey, puts, lock, pc, seen, checked, rpc, pkey, served>>

PurgeStorageFails ==
  /\ ppc = "read"
  /\ ppc' = "idle"
  /\ UNCHANGED <<driver, row, rowKey, store, puts, lock, pc, seen, checked, rpc, pkey, served>>

PurgeDelete ==
  /\ ppc = "removed"
  /\ row' = IF row = "deleting" THEN "gone" ELSE row
  /\ ppc' = "idle"
  /\ UNCHANGED <<driver, rowKey, store, puts, lock, pc, seen, checked, rpc, pkey, served>>

\* GET /files/:id/download (files.http.ts:134-157) and getFile (184-194): a
\* link only for a ready row (readyFile, 205-213), to the row's key.
Download ==
  /\ row = "ready" \/ ("download_pending" \in Broken /\ row = "pending")
  /\ served' = served \cup {store[rowKey]}
  /\ UNCHANGED <<driver, row, rowKey, store, puts, lock, pc, seen, checked, rpc, ppc, pkey>>

Next ==
  \/ Put
  \/ \E c \in Completers : CLock(c) \/ CStat(c) \/ CCopy(c) \/ CDrop(c) \/ CCommit(c) \/ CAbort(c)
  \/ Prune
  \/ RemoveBytes \/ RemoveStops \/ RemoveClaim
  \/ PurgeRead \/ PurgeRemove \/ PurgeStorageFails \/ PurgeDelete
  \/ Download

Spec == Init /\ [][Next]_vars

(***************************************************************************)
(* Properties                                                              *)
(***************************************************************************)

\* No ready file without its bytes: a ready row points at its own key, and
\* that key holds exactly the version the completion checked.
ReadyHasCheckedBytes ==
  row = "ready" => /\ rowKey = "final"
                   /\ checked # 0
                   /\ store["final"] = checked

\* No deleted bytes under a live record: while a row is ready, nothing
\* removes or replaces the bytes under its key.
NoBytesDeletedUnderLiveRecord ==
  [][row = "ready" => store'[rowKey] = store[rowKey]]_vars

\* Prune never races a claim: while a completion is under way, the row stays
\* pending and the completion holds its lock.
CompletionOwnsItsRow ==
  \A c \in Completers : pc[c] # "idle" => row = "pending" /\ lock = c

\* Download only when ready: every download link reads the checked bytes.
DownloadsServeChecked ==
  \A v \in served : v # 0 /\ v = checked
=============================================================================
