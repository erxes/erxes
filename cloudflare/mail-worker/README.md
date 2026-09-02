# erxes mail worker

Receives mail through Cloudflare Email Routing, parses it, and forwards a signed
JSON payload to the frontline plugin's `/mail/receive` endpoint.

This package is deliberately outside the pnpm workspace globs (`backend/**`,
`frontend/**`) so its Worker dependencies stay isolated from the monorepo.

One Worker serves every tenant. The tenant is read out of the recipient address,
and for a tenant that lives on the shared erxes domain everything else — the erxes
URL, the signing key, the R2 prefix — is derived from it. An install that answers
on its own domain cannot be reached that way, so it gets one entry in the
`MAIL_ROUTES` namespace carrying its URL and its own secret; see
[Enterprise installs](#enterprise-installs).

## How a message flows

1. `email()` rejects anything over 25 MiB before parsing, so a large message can
   never exhaust the Worker's 128 MB memory limit.
2. The tenant is the part of the local address before `--`
   (`acme--support-a7f3k2@…` → `acme`), read after any `+tag` is stripped, and it
   must be a valid DNS label. That check is load-bearing: the tenant is substituted
   into `ERXES_ENDPOINT_TEMPLATE`, and RFC 5322 permits characters like `/` in a
   local part, so `a/b--x@…` would otherwise point a signed delivery at a different
   host. An address with no usable tenant falls back to `DEFAULT_TENANT`; with
   neither, the message is rejected at SMTP level, so a catch-all zone cannot be
   used to probe the API.
3. Attachments are written straight to R2 under `<tenant>/<id>/<n>`. The payload
   keeps only their metadata plus a signed download URL, so nothing is
   base64-encoded in memory.
4. The payload itself is stored in R2 and only its id is queued — queue messages
   stay far below the 128 KB limit no matter how large the mail was.
5. The queue consumer looks the tenant up in `MAIL_ROUTES` and falls back to
   `ERXES_ENDPOINT_TEMPLATE` with `{tenant}` substituted, then signs the stored
   payload and posts it. A 5xx is retried with Cloudflare's backoff, as are
   401, 403, 408, 425 and 429 — a credential failure is transient, so a secret
   rotation or a rolling restart rides itself out; any other 4xx is
   dead-lettered immediately. Stored objects are deleted once erxes accepts the
   message.
6. `setReject` is used only for a message that is too large, unroutable, or
   unparseable — permanent SMTP-level failures the sender should learn about.

## Signing

No master secret is ever used to sign a request. Both sides first derive

```
tenantSecret = HMAC-SHA256(master, tenant)
```

where `master` is the tenant's own `secret` when it has a `MAIL_ROUTES` entry and
`WEBHOOK_SECRET` otherwise — the Worker resolves it from the address it routed, the
API from its own `MAIL_WEBHOOK_SECRET` and request subdomain (or `MAIL_TENANT`).
The request then carries `x-erxes-timestamp` (unix seconds) and
`x-erxes-signature` over `${timestamp}.${body}`, and the API rejects a skew beyond
five minutes. A payload signed for one tenant is therefore invalid at any other
tenant's host, and cannot be replayed later.

The Worker also serves `GET /attachments/<tenant>/<id>/<n>?token=<hmac>` so erxes
can pull an attachment during delivery. That token is derived from `WEBHOOK_SECRET`
and the tenant, and only the Worker ever signs or verifies it, so it stays valid
whatever master a tenant delivers under. It covers the object key, so a leaked
token reaches only that tenant's objects, and the bucket stays private — no R2
credentials leave Cloudflare.

## Deploy

1. Pick a domain **dedicated to mail** — erxes uses `erx.es` — add it to
   Cloudflare as its own zone, and enable Email Routing on it. Its MX has to
   become Cloudflare's alone: onboarding refuses while another provider's MX is
   present ("Existing non-Cloudflare MX records conflict with Email Routing"), so
   a domain already carrying company mail, such as `erxes.io` on Google
   Workspace, is out. A subdomain of that domain is out for the same reason —
   Cloudflare does serve Email Routing subdomains, but only once the apex itself
   is onboarded, which is the very step that would replace the apex MX.
2. Set `ERXES_ENDPOINT_TEMPLATE` in `wrangler.toml` to the gateway route with a
   `{tenant}` placeholder, e.g.
   `https://{tenant}.erxes.io/gateway/pl:frontline/mail/receive`. That covers every
   tenant whose host is the substituted template; installs on their own domain are
   registered in `MAIL_ROUTES` instead. A Worker dedicated to a single install can
   skip the template: set `ERXES_ENDPOINT` to the fixed URL plus `DEFAULT_TENANT`
   to the same value as the API's `MAIL_TENANT`. Resolution order is
   `MAIL_ROUTES` → `ERXES_ENDPOINT` → the template, so a `.dev.vars` carrying
   `ERXES_ENDPOINT=http://localhost:3304/mail/receive` keeps a local run local
   without touching this file.
3. Set `ATTACHMENT_BASE_URL` to this Worker's own public origin — its
   `workers.dev` URL or the custom domain routed to it. erxes downloads
   attachments from there, so leaving the local default in place silently drops
   every attachment.
4. Create both queues, the bucket, its retention rule and the routing namespace.
   The script is idempotent, so it is safe to re-run against an account that
   already has some of them, and it prints the namespace id to paste into
   `wrangler.toml`:

   ```bash
   npm install
   npm run setup                 # MAIL_RETENTION_DAYS=14 by default
   npx wrangler secret put WEBHOOK_SECRET
   npx wrangler deploy
   ```

   `WEBHOOK_SECRET` must match `MAIL_WEBHOOK_SECRET` on every API reached through
   the endpoint template; installs registered in `MAIL_ROUTES` use the secret in
   their own entry instead.

5. In Email Routing, add a catch-all rule that sends to this Worker. Neither this
   nor the secret can be scripted, which is why step 4 ends by naming them.

Stored objects are deleted the moment erxes accepts a message, so the bucket only
holds mail that is in flight or that failed. The retention rule set in step 4 is
what eventually clears the failures — see [Dead letters](#dead-letters).

## Enterprise installs

An install that answers on its own domain is registered with one `MAIL_ROUTES`
entry, keyed by its tenant, holding the endpoint and a secret generated for it:

```bash
npx wrangler kv key put --binding=MAIL_ROUTES acme \
  '{"endpoint":"https://erxes.acme.com/gateway/pl:frontline/mail/receive","secret":"<generated>"}'
```

The install then sets two values, and nothing else:

```
MAIL_TENANT=acme
MAIL_WEBHOOK_SECRET=<the same generated secret>
```

`MAIL_DOMAIN` already defaults to the shared mail domain, so it is only set when
an install receives on a different one. Both sides derive
`HMAC-SHA256(secret, "acme")` from there, exactly as the template path derives from
`WEBHOOK_SECRET`, so the API needs no code or configuration beyond those two
values.

Notes that decide whether this works:

- The tenant must be unique across everything this Worker serves, SaaS subdomains
  included. Two installs answering to one tenant would send one install's mail to
  the other.
- The endpoint must be reachable from Cloudflare over HTTPS with a valid
  certificate. An install that is only reachable inside a private network cannot
  be delivered to.
- Rotating a secret means rewriting the entry and the install's
  `MAIL_WEBHOOK_SECRET`. Mail that arrives between the two is retried — a `401`
  is treated as transient, so a short mismatch during a rolling restart rides
  itself out — and only lands in the dead-letter queue if every retry fails.
- Deleting an entry drops the tenant back onto the template, which for a private
  domain resolves to a host that either does not exist or rejects the signature.
  Either way the mail ends up in the dead-letter queue instead of at the wrong
  install, which is the intended hard stop when one is decommissioned.
- Entries are read with a five-minute cache, so a new or changed entry takes up to
  that long to take effect on every edge.

## Dead letters

`erxes-mail-dlq` receives two kinds of message: those the Worker gave up on
immediately (erxes answered a 4xx it cannot ride out — unknown address or
malformed payload) and those that exhausted the five retries, which is where a
credential failure ends up because `401` and `403` are retried rather than
dead-lettered on sight. The body carries the original `id`, `to`, `messageId`
and, for the immediate case, the erxes status and error text; the
retry-exhausted kind carries only the original fields, which is why `status` and
`error` are optional.

This Worker consumes that queue itself and logs one line per message:

```
mail dead letter {"id":"…","tenant":"acme","to":"…","messageId":"…","status":401,"error":"…"}
```

`[observability]` is on, so those lines are queryable in Workers Logs; filter on
`mail dead letter` there, and push them to whatever pages you through Logpush if
someone needs to be woken up. Consuming the queue also keeps it draining, so a
burst of failures cannot back it up into an unreadable pile.

A dead-lettered message keeps its stored payload and attachments in R2 — they are
deleted only when erxes accepts a message — so the mail itself is still there
after the delivery gave up. That is what the retention rule from
[Deploy](#deploy) eventually clears, and what makes a replay possible: pull the
object and post it straight at the API once the cause is fixed.

```bash
npx wrangler r2 object get erxes-mail-inbound/acme/<id>.json --file=replay.json

MAIL_ENDPOINT=https://acme.erxes.io/gateway/pl:frontline/mail/receive \
MAIL_TENANT=acme \
MAIL_WEBHOOK_SECRET=<secret> \
  node scripts/send-fixture.mjs replay.json
```

All three matter. The R2 prefix names the tenant the message belongs to, and the
signing key is derived from it — but the script falls back to the first label of
`MAIL_ENDPOINT`'s host, which is `localhost` when that variable is unset, so
leaving either out signs for the wrong tenant and the API answers `401`. The
secret is `WEBHOOK_SECRET` for a tenant served through the endpoint template, and
the `secret` from that tenant's `MAIL_ROUTES` entry when it has one. Replaying is
safe to repeat: the API dedupes on `messageId` per inbox.

## Outbound attachments

When `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_EMAIL_API_TOKEN` are set, outbound
mail goes through the Cloudflare Email Sending REST API, which takes attachments
as base64 `content` entries. Cloudflare caps a whole message at 5 MiB, and only
raises that to 25 MiB for verified destination addresses — the API-side cap
(`MAX_ATTACHMENT_BYTES`) is the looser 25 MiB, so larger messages are rejected by
Cloudflare rather than by erxes. Attachments without a stored URL are rejected
before the request is made.

## Local testing without Cloudflare

The Worker is not needed to develop the API side. Post a fixture straight at the
plugin instead:

```bash
MAIL_WEBHOOK_SECRET=<same secret as .env> node scripts/send-fixture.mjs inbound
MAIL_WEBHOOK_SECRET=<same secret as .env> node scripts/send-fixture.mjs reply
```

`inbound.json` opens a conversation; `reply.json` carries `inReplyTo` pointing at
it, so it must land in the same conversation rather than starting a new one.
Fixtures carry attachments as inline base64 `content`, which the API still
accepts alongside the `url` form the Worker now sends.

The script derives its signing key exactly as the API does: from `MAIL_TENANT` if
set, otherwise from the first label of the endpoint host (`localhost` by default).
Set `MAIL_TENANT` here whenever it is set in the repo `.env`, or every post comes
back `401`. The `--to` address does not decide the key — only the tenant does.

Override the target with `MAIL_ENDPOINT` (defaults to
`http://localhost:3304/mail/receive`). `--envelope-from=<address>` sets the SMTP
envelope sender, which is how the unverified-sender warning is reproduced without
Cloudflare:

```bash
MAIL_WEBHOOK_SECRET=<secret> node scripts/send-fixture.mjs inbound \
  --fresh --envelope-from=spoofer@elsewhere.test
```

To exercise the Worker itself, `npx wrangler dev` simulates the queues, the
bucket and the routing namespace locally. `ATTACHMENT_BASE_URL` has no default —
`wrangler.toml` carries the deployed origin, so a local run needs it overridden
in `.dev.vars` or every attachment url points at the deployed Worker:

```
ERXES_ENDPOINT=http://localhost:3304/mail/receive
ATTACHMENT_BASE_URL=http://localhost:8787
```

```bash
npx wrangler dev
node scripts/send-to-worker.mjs message.eml --to=<integration address>
```
