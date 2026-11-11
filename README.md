# erxes core (Postgres)

The new thin core of erxes: organisations, team, sign-in, customers and
companies, and the platform services plugins share. See `AGENTS.md` and
`docs/design.md`.

## Run locally

```sh
docker compose up -d                 # Postgres on 127.0.0.1:5434
cp .env.example .env
pnpm install
pnpm dev                             # API http://localhost:3400, UI http://localhost:3500
```

On a new database the UI opens "Initial Configuration Steps": create the
organisation and its owner, and you are signed in. (Or create them from the
command line: `pnpm bootstrap -- --subdomain acme --name "Acme" --email owner@acme.mn --password '<password>'`.)
Set `CORE_SETUP=false` where organisations come from the erxes SaaS service. To show
plugin UIs in core, set `PUBLIC_PLUGINS`, e.g.
`PUBLIC_PLUGINS=hr_ui@http://localhost:3025/remoteEntry.js pnpm dev:ui`.
