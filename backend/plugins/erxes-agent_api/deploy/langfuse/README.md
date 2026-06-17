# Central Langfuse v3 server

One shared Langfuse for **all** erxes tenants' agent observability. Deploy it
**once** on a dedicated host — not per client. Clients only point their
erxes-agent `.env` at it.

The app (`docker-compose.yml`) is configured purely by full connection-string
env vars — nothing host/port is hardcoded. The backing stores are external by
default; a bundled all-in-one set (behind the `bundled-stores` compose profile)
is provided for dev / small setups.

## Deploy (once, on the central host)

```bash
cd backend/plugins/erxes-agent_api/deploy/langfuse
cp .env.example .env          # then edit EVERY secret
```

**Production — managed stores (recommended):** set `LANGFUSE_DATABASE_URL`,
`LANGFUSE_CLICKHOUSE_URL`, `LANGFUSE_REDIS_URL`, `LANGFUSE_S3_*` to your managed
endpoints, then:

```bash
docker compose up -d          # app only; uses your external Postgres/CH/Redis/S3
```

**All-in-one box (dev / small):** use the bundled-store values in `.env.example`,
then start with the profile:

```bash
docker compose --profile bundled-stores up -d
```

Then either way — first-boot login (sign-up is **disabled by default**):
- **Default (admin seed):** set `LANGFUSE_INIT_ORG_ID` / `LANGFUSE_INIT_USER_EMAIL`
  / `LANGFUSE_INIT_USER_PASSWORD` before first boot. Langfuse seeds that admin
  once; open `LANGFUSE_PUBLIC_URL` and log in with it.
- **Or self-register once:** set `LANGFUSE_DISABLE_SIGNUP=false` for the first
  boot, open the UI, create your account → organization, then set it back to
  `true` and redeploy.
- Once logged in, create a **project** and copy its **public** (`pk-lf-…`) and
  **secret** (`sk-lf-…`) keys.
- Put the app behind your TLS/reverse proxy; set `LANGFUSE_PUBLIC_URL` to the
  public HTTPS URL. Only `langfuse-web` (`LANGFUSE_PORT`) is exposed; bundled
  store ports stay on the compose network (not published).

## Point a client's erxes-agent at it

In each client's erxes `.env`:

```bash
ERXES_AGENT_EVALUATION=enable
ERXES_AGENT_EVALUATION_DSN=https://<public-key>:<secret-key>@langfuse.your-domain.com
```

## One project vs project-per-client

Both work with the same code:

- **Shared project** — give every client the SAME keys. All traces land in one
  project; filter by trace `serviceName` = `erxes-agent:<subdomain>` (the agent
  runtime tags this automatically).
- **Project per client** — create a Langfuse project per client and hand each
  its own keys. Cleaner isolation/access control; pick this if clients should
  never see each other's data.

See `../../docs/SCORING-OBSERVABILITY.md` for how scoring works end to end.
