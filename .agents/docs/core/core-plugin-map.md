# Core Plugin Map

The core system handles shared entities, API gateway composition, and Module Federation hosting.

## Backend Layout (`backend/core-api/`)

```
src/
├── graphql/           ← Unified core schema (typeDefs)
├── modules/
│   ├── auth/          ← Token auth, OAuth apps
│   ├── contacts/      ← Customer, Company models & resolvers
│   ├── products/      ← Product, Category models & resolvers
│   ├── properties/    ← Dynamic custom fields engine
│   ├── segments/      ← Elasticsearch segment logic
│   ├── tags/          ← Cross-cutting tags
│   └── organization/  ← Branch, Department (Team structure)
├── meta/              ← Extensibility bindings (cron, automation)
└── init-trpc.ts       ← Core tRPC router definition
```

## Frontend Layout (`frontend/core-ui/`)

`core-ui` serves as the Module Federation **Host**. It loads all other plugin UIs dynamically.

```
src/
├── modules/           ← Core CRM UIs (Contacts, Products, Settings)
├── layout/            ← Global navigation, sidebar, topbar
├── utils/             ← Shared frontend logic (core only; erxes-ui is generic)
└── bootstrap.tsx      ← React mount + remote loader
```

## Key Architectural Differences
1. **Core is a Host:** `core-ui` doesn't export remotes; it consumes them.
2. **Federation Baseline:** Every other plugin extends `User`, `Customer`, or `Company` from core.
3. **Dynamic Fields:** Core handles the storage and resolution of `customFieldsData` for its own entities, and plugins use the `properties` module to define fields for their entities (like Deals or Tasks).
