# erxes Architecture

## Project Shape

erxes is a pnpm + Nx monorepo with backend services, frontend Module Federation
apps, shared libraries, plugins, and a few standalone apps.

```text
backend/
  gateway/              # API gateway, Apollo Router, proxies, locales
  core-api/             # Core business modules
  erxes-api-shared/     # Shared backend types, utilities, core modules
  plugins/<name>_api/   # Backend plugin services
  services/             # Background services

frontend/
  core-ui/              # Module Federation host app
  libs/erxes-ui/        # Shared UI primitives, state, utilities
  libs/ui-modules/      # Shared product/business UI modules
  plugins/<name>_ui/    # Frontend plugin remotes

apps/
  frontline-widgets/
  client-portal-template/
  posclient-front/
```

## Technology Stack

- Package manager: `pnpm` only.
- Build orchestration: Nx 20.
- Frontend: React 18, Rspack, Module Federation, TailwindCSS, Radix-based
  `erxes-ui`, `@tabler/icons-react`, Apollo Client, Jotai, React Router.
- Backend: Node.js, TypeScript, Express, Apollo Server/Federation, tRPC,
  Mongoose/MongoDB, Redis/BullMQ, Elasticsearch.
- i18n: `react-i18next` in frontend, locale JSON served by the gateway.

## Boundaries

- Keep plugins isolated. Do not import from one plugin into another plugin.
- Put shared frontend primitives in `frontend/libs/erxes-ui`.
- Put shared frontend business modules in `frontend/libs/ui-modules`.
- Treat `frontend/core-ui` as the Module Federation host, not the default home
  for reusable plugin UI.
- Put shared backend code in `backend/erxes-api-shared` only when there is clear
  reuse across services.
- Follow the touched project's existing GraphQL, Apollo, tRPC, routing, state,
  and model patterns.
- Do not modify backend contracts from frontend work unless explicitly
  requested.
