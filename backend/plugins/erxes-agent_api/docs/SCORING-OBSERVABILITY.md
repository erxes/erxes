# Agent scoring + central observability (Langfuse)

Live-scores every (sampled) agent turn and ships **traces + scorer scores +
thumbs feedback** to a self-hosted **Langfuse** — one shared server monitors
every erxes client, either as a single shared project (filter by
`serviceName=erxes-agent:<subdomain>`) or one project per client (see the deploy
README). All built on Mastra's native observability exporter layer; no custom
telemetry plumbing.

Status: **OFF by default.** Zero overhead until `ERXES_AGENT_EVALUATION=enable`.

## How it works

```text
agent turn ──▶ scorers run (sampled) ──▶ agent.__registerMastra(host)
                                              │
                                  host.observability (Observability)
                                              │
                                       LangfuseExporter ──▶ Langfuse server
                                       (traces + scores + feedback)
```

- Production builds **standalone agents** (`mastra/agentRuntime.ts`) — they have
  no Mastra parent, so by default they export nothing. When scoring is enabled,
  each agent is registered onto a lightweight per-tenant `Mastra`
  (`mastra/scoring/observability.ts`) whose `Observability` carries a
  `LangfuseExporter`. The agent then emits through it.
- Scorers (`mastra/scoring/scorers.ts`) are attached to the agent and run on its
  output:
  - **`response-completeness`** — heuristic, free, deterministic. `1` when the
    agent produced a non-empty final answer, else `0`. Always runs.
  - **`answer-relevancy`** — LLM-judge using the agent's **own** model. Rates
    `0..1` how directly the answer addresses the user's request. **Sampled.**
- Multi-tenant: the host's `serviceName` is `erxes-agent:<subdomain>`, so you
  filter per client in Langfuse. One Langfuse server, all clients.

## Enable / disable (`.env`) — just two vars

| Var | Meaning | Default |
|---|---|---|
| `ERXES_AGENT_EVALUATION` | The single master switch — `enable` turns the whole feature on | off |
| `ERXES_AGENT_EVALUATION_DSN` | One Sentry-style string for the central Langfuse: `https://<publicKey>:<secretKey>@langfuse.your-domain.com` | — |

That's the entire client-side surface. The DSN encodes the server URL + public
key + secret key, so every client gets the same one-line value. Langfuse is a
**separate** server — there is no "same host" default; without a valid DSN,
export is off (no `localhost` fallback). The LLM-judge sample rate is a code
constant (`scorers.ts`), intentionally kept off the env surface.

- **Evaluation on, DSN unset/invalid** → scorers still compute (visible in logs
  / scorer data) but nothing is exported, and a one-time warning is logged.
- **Evaluation off** → no scorers attached, no host built, no registration. The
  agent runtime is byte-for-byte its previous behaviour.

To disable: set `ERXES_AGENT_EVALUATION=disable` (or remove it) and restart (the
runtime reads env at agent-build time; restart to apply).

## Langfuse is ONE central server (not per client)

Langfuse v3 is deployed **once** on a dedicated host, shared by all tenants.
Clients never run their own Langfuse — they only point their `.env` at the
central server. Its standalone stack + setup guide live in
[`deploy/langfuse/`](../deploy/langfuse/README.md) (6 containers: web, worker,
postgres, clickhouse, redis, minio — all on that one box).

### Point a client's erxes-agent at the central server

After the central server is up and you've created a project (see the
`deploy/langfuse` README), set in each client's erxes `.env`:

```bash
ERXES_AGENT_EVALUATION=enable
ERXES_AGENT_EVALUATION_DSN=https://<public-key>:<secret-key>@langfuse.your-domain.com
```

(`pk-lf-…` = project public key, `sk-lf-…` = secret key, host = the central
server.) Restart the erxes-agent stack. Chat with an agent → traces + scores
appear in Langfuse, tagged by service `erxes-agent:<subdomain>`. On the
officenext swarm, `.env` is baked at deploy time — redeploy to apply.

### One project vs project-per-client

Both work with the same code. Shared keys → all tenants in one project, filter
by `serviceName`. Per-client projects → separate keys per client for hard
isolation. (Details in the `deploy/langfuse` README.)

## Files

- `mastra/scoring/config.ts` — env gating (pure, injectable env).
- `mastra/scoring/scorers.ts` — the two scorers (`createScorer`).
- `mastra/scoring/observability.ts` — per-tenant Mastra + `LangfuseExporter`.
- `mastra/agentRuntime.ts` — attaches scorers + registers the host (env-gated).
- `deploy/langfuse/` — standalone central Langfuse v3 stack + setup README.
