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

The new CMS action is not added to default permission groups. Grant it
explicitly to the appropriate custom group. The existing CMS owner bypass
remains; it does not bypass Postiz membership. A Postiz Admin who enables
sharing must also have the CMS permissions. Sharing grants access to usable
channels throughout the assigned Postiz workspace, not individual channels.

## Deployment sequence

No production deployment is performed by this change. Deploy in this order:

1. `erxes-postiz`: the signed `/api/erxes/cms/:action` backend endpoint.
2. `postiz-gateway`: `/v1/cms` and its durable SQLite delivery ledger.
3. `erxes-private/backend/plugins/agent_api`: signed `postizCms.execute` tRPC.
4. `erxes/backend/plugins/content_api`: GraphQL contracts and delivery worker.
5. `erxes/frontend/plugins/content_ui`: publish sheet and delivery history.

Required configuration:

| Component                 | Setting                                                | Purpose                                                                                                      |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| content_api and agent_api | `CMS_POSTIZ_SHARED_SECRET`                             | Same random secret of at least 32 characters; distinct per deployment. Never expose it in frontend settings. |
| Postiz backend            | `ERX_CMS_MEDIA_ORIGINS`                                | Comma-separated exact HTTPS origins for trusted public CMS image storage. Empty permits text-only sharing.   |
| Gateway and Postiz        | Existing instance signing key / `ERX_PROVISIONING_KEY` | Reused managed-instance authentication.                                                                      |

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
- To stop new CMS work, disable the content worker by removing its new secret
  through the normal approved deployment workflow. Already accepted Postiz
  workflows may still publish. Roll back the UI first, then CMS/agent changes;
  retain the additive Mongo and SQLite data.
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
