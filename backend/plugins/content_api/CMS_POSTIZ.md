# CMS sharing through Postiz

## Scope

Only records in the CMS post model with `type: post` and `status: published`
can be shared. Pages, custom content types, Web Builder records, drafts and
scheduled CMS posts are excluded. Saving a scheduled post does not schedule a
social post.

The explicit Publish/Save action on a published ordinary post opens an erxes
sheet. Authors can publish to CMS only, or select up to ten channels and four
attached JPEG/PNG/WebP images. The caption is editable; the saved public article
URL is appended server-side. Videos, platform-specific advanced settings and
automatic edit/delete synchronization are not included.

The CMS save completes before the social queue request. Social failure never
rolls back CMS publication. If a response is lost, the open sheet retains the
saved post ID and exact social request; retry does not recreate the CMS post.
After closing the sheet, inspect Social delivery history before sharing again.

`cmsPostizValidate` runs the same permissions and provider validation without
persisting a job or publishing. The sheet uses it before freezing a delivery
request, so ordinary validation failures leave caption and image fields editable.

## Ownership and authorization

`content_api` owns CMS permissions, publication, saved content snapshots and
the tenant-local `cms_postiz_deliveries` collection. `agent_api` owns Postiz
membership and placement. The gateway resolves the installation/tenant to a
Postiz organization; clients never supply a workspace URL or organization ID.
Postiz validates the selected channel against that organization and dispatches
through its existing PostsService and Temporal workflow.

Sharing requires all of:

- Active erxes membership and access to the assigned CMS.
- `cmsPostsSharePostiz` plus `cmsPostsApprove` or `cmsPostsCreatePublished`.
- The existing author/document scope and language permission. A non-default
  translation must already exist.
- Explicit erxes-side Postiz Admin or Member access.
- An available placement, including SaaS approval and expiry checks.
- `cmsPublishingEnabled` enabled by a Postiz Admin.

The sharing action is included in the existing CMS Journalist 1, Journalist 2,
Editor and Admin default permission groups; CMS Viewer remains read-only.
Existing assignments use the updated role definitions without a database
backfill or a new custom group. Journalist 2 still has only create-for-review
publication access: its sharing grant alone cannot dispatch posts without an
additional approve/create-published grant. CMS assignment, language access,
published-post status and Postiz membership checks remain mandatory.
The existing CMS owner bypass remains; it does not bypass Postiz membership.
A Postiz Admin who enables sharing must also have the CMS permissions.
Sharing grants access to usable
channels throughout the assigned Postiz workspace, not individual channels.

## Deployment sequence

No production deployment is performed by this change. Deploy in this order:

1. `erxes-postiz`: the signed `/api/erxes/cms/:action` backend endpoint.
2. `postiz-gateway`: `/v1/cms` and its durable SQLite delivery ledger.
3. `erxes-private/backend/plugins/agent_api`: signed `postizCms.execute` tRPC.
4. `erxes/backend/plugins/content_api`: GraphQL contracts and delivery worker.
5. `erxes/frontend/plugins/content_ui`: publish sheet and delivery history.

Required configuration:

| Component                 | Setting                                                | Purpose                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| content_api and agent_api | Existing `JWT_TOKEN_SECRET`                            | Must match across both APIs. CMS derives its own purpose-specific signing key automatically; no additional secret is configured. Never expose it in frontend settings. |
| Postiz backend            | `ERX_CMS_MEDIA_ORIGINS`                                | Comma-separated exact HTTPS origins for trusted public CMS image storage. Empty permits text-only sharing.                                                             |
| Gateway and Postiz        | Existing instance signing key / `ERX_PROVISIONING_KEY` | Reused managed-instance authentication.                                                                                                                                |

The CMS envelope uses HKDF-SHA256 with salt `erxes-cms-postiz-v1`, info
`signing` and a 32-byte output. HMAC still covers `cms-postiz-v1`, timestamp,
nonce and the exact tenant/user/action/payload body. Missing or whitespace-only
JWT configuration fails closed; the existing secret's bytes are otherwise used
unchanged, matching erxes internal-auth compatibility. Derivation separates the
CMS protocol from JWT signing but does not strengthen a weak or exposed root
secret, or isolate services that share that root. Use a securely generated root
secret and coordinate any rotation separately, including enterprise Postiz
credential re-encryption. Do not rotate JWT as part of this feature rollout.

`CMS_POSTIZ_SHARED_SECRET` is retired and ignored, including when JWT is absent.
Upgrade agent_api and content_api together in a coordinated deployment window;
old and new signers/verifiers are not compatible. Pause content_api processing
through approved deployment tooling during the switch if deliveries are active.
Preserve jobs and ledgers; never clear them to resolve an authentication failure.
After both APIs are updated, the obsolete variable can be removed. Rollback must
restore both API versions and their previous matching CMS secret configuration.
SaaS tenants may share the JWT root; signed tenant context and current membership
and workspace checks remain mandatory on every request.

Only allow operator-controlled image origins without open redirects or private
network destinations. Images must remain publicly readable by Postiz and the
social provider. If `RESTRICT_UPLOAD_DOMAINS` is configured in Postiz, its
existing validator must also permit those URLs. The bridge is disabled on
Postiz instances with `STRIPE_SECRET_KEY` configured.

Enable sharing from the CMS publish sheet while signed in as a permitted
Postiz Admin. Other users see CMS-only publishing until that is done. There are
no new Postiz API keys to paste into CMS settings.

## Queue and failure semantics

Mongo jobs use deterministic IDs per client request/channel. Unique `_id`
upserts and content fingerprints prevent conflicting retries. The worker claims
120-second leases, rechecks current permissions before dispatch and polls
Postiz status. Only the saved snapshot is sent; later CMS edits do not silently
change it.

### Tenant routing

New jobs persist `subdomain` from the authenticated CMS request, including
explicit failed-delivery retries. The browser cannot provide or override it.
Dispatch, current-user permission checks and remote-status polling all use that
saved value. Deterministic request IDs and content fingerprints are unchanged.

Enterprise runs one sweep against the configured installation database, then
routes each job through its saved tenant. It does not use `os` as a tenant or
derive a tenant from `DOMAIN`, the public article URL or a user ID. This works
for any enterprise hostname without a new environment variable. A tenant rename
or workspace reassignment still requires deliberate delivery reconciliation.

SaaS continues discovering tenants through `getSaasOrganizations`. Each sweep
opens only that tenant's database; a saved tenant that differs from the database
tenant becomes UNKNOWN without any call to core or Postiz. A legacy SaaS job
without `subdomain` is bound to its authoritative database tenant under its
existing lease before any dispatch. If the lease is lost, it is not sent.

Legacy enterprise jobs have no authoritative routing tenant in their snapshot.
Pending/queued jobs missing that field become UNKNOWN with a tenant-recovery
message, without publishing or polling a potentially different workspace.
They are not silently retried through whichever hostname next views the post.
Terminal jobs remain terminal. History retains legacy records for inspection,
but excludes snapshots explicitly bound to another request tenant.

### Upgrading existing queues

This routing fix requires only a rebuilt `content_api`; it does not change
`agent_api`, the gateway, Postiz, JWT configuration or plugin startup.

For existing enterprise deliveries, an operator must:

1. Back up the relevant CMS delivery records and pause content_api processing
   through approved deployment tooling before recovery.
2. Identify each exact delivery `_id`, installation and originating tenant from
   the original request/deployment and gateway assignment. Never mass-assign all
   rows to `os`, a sample tenant, or the tenant of an unrelated record.
3. Reconcile the original `requestId` against the gateway ledger, the intended
   Postiz workspace and the actual provider. If a remote post exists, retain or
   recover its exact `remotePostId` and use status polling, not a new publish.
4. Backfill only verified records with the originating `subdomain`. Preserve
   `_id`, `requestId`, snapshot, channel, actor and any remote post ID. If a
   previously UNKNOWN record is explicitly approved for recovery, restore
   QUEUED for a known remote post, or PENDING only after confirming no dispatch
   occurred; reset attempts and scheduling/lease fields only for that approved
   recovery. Ambiguous records must remain UNKNOWN.
5. Resume the new worker and verify its status in the intended workspace.

The code change does not execute a production backfill or replay any post.
Rollback must preserve `subdomain` and all ledgers. Pause delivery processing
before rolling back to an older worker, which cannot route enterprise jobs
correctly; do not drop the new field or generate replacement request IDs.

The gateway commits an UNKNOWN ledger entry before dispatch. A matching
request is never dispatched twice, including after a timeout or process crash.
This intentionally favors avoiding duplicates over automatic recovery: a crash
between ledger insertion and dispatch may require manual review.

| State     | Meaning / next action                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| PENDING   | Saved in CMS delivery queue, not yet acknowledged by Postiz.                                                                        |
| QUEUED    | Postiz accepted the post; publication is not yet confirmed.                                                                         |
| PUBLISHED | Postiz reports publication; a provider URL is shown when available.                                                                 |
| FAILED    | Postiz reports failure or the remote record is unavailable. Review Postiz and the actual channel before using Retry this channel.   |
| UNKNOWN   | Delivery cannot be confirmed. No automatic retry or retry button. Review Postiz and the actual channel before creating a new share. |
| CANCELLED | CMS publication or permissions changed before the first dispatch.                                                                   |

Explicit failed-channel retry creates one deterministic successor. Retrying the
same failed job again returns that successor. A provider error can still follow
a successful external write, so user confirmation is required; exactly-once
publication by the external social network is not guaranteed.

## Data changes, rollback and operations

- Mongo adds a tenant-local collection and declares indexes on pending work and
  post history. If production disables automatic index creation, create these
  indexes through approved deployment tooling before enabling the worker.
  No existing records are rewritten or deleted.
- The agent Postiz access record adds an optional boolean, default false.
- Gateway adds `cms_deliveries`; back up SQLite with the existing database-aware
  backup procedure before deploying. Retain this ledger with placement data.
- No Postiz Prisma migration is required.
- Never delete delivery records/ledgers to retry a post. That removes duplicate
  protection. Restoring an older database backup can also lose acknowledgments;
  reconcile pending/unknown records with Postiz before resuming workers.
- Do not remove or change `JWT_TOKEN_SECRET` to stop CMS work; other erxes
  authentication and enterprise Postiz credentials depend on it. Disable sharing
  through the Admin control below, or pause content_api processing through the
  approved deployment workflow. Already accepted Postiz workflows may still
  publish. Roll back the UI first, then both CMS/agent versions together; retain
  the additive Mongo and SQLite data.
- Admins can disable sharing using `cmsPostizEnable(..., enabled: false)`.
  This denies new bridge requests, including polling. It does not cancel
  workflows already accepted by Postiz.

## Verification

From the public erxes root:

```sh
pnpm nx build content_api
pnpm nx build content_ui
pnpm exec jest --config backend/plugins/content_api/jest.postiz.cjs --runInBand
node frontend/plugins/content_ui/test/postiz-preview.cjs
```

The preview serves real erxes primitives with synthetic Apollo responses on
`127.0.0.1:4318`; it cannot contact a real Postiz server. Modes: `?mode=retry`,
`validation`, `disabled`, `empty`, `error`, `loading`, `failed`; append `&dark`
for dark mode.

Before production rollout, run a staging integration check with two isolated
tenants, an uninvited user, a revoked member, a language-restricted author,
an unavailable channel and a gateway timeout. Approve one real test post
separately and verify its channel result. Unit/contract tests do not establish
live provider delivery or account API-credit availability.
