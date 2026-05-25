# Operation Plugin — Annotated Map

> Where things live in `backend/plugins/operation_api/` and `frontend/plugins/operation_ui/`. Use this when a skill says "look at X" and you need to find it.

For the *file inventory per module*, see [`../../plugins/operation/INDEX.md`](../../plugins/operation/INDEX.md) and `plugins/operation/modules/*.md`. This file explains the *shape* — what each directory means.

## Backend (`backend/plugins/operation_api/`)

```
src/
├── main.ts                          ← entry point; calls startPlugin()
├── connectionResolvers.ts           ← Mongoose model factory; generateModels(subdomain)
├── init-trpc.ts                     ← appRouter config
├── apollo/                          ← Apollo Server bootstrap
│   ├── subscription.ts              ← GraphQL subscriptions
│   ├── resolvers/                   ← root resolver index
│   └── schema/                      ← root typedef index (merges modules')
├── modules/                         ← operation backend modules
│   ├── activity/                    ← task and project CRUD activity logging
│   ├── cycle/                       ← planning cycles definitions and db
│   ├── milestone/                   ← milestone definitions and resolvers
│   ├── note/                        ← task detail notes definitions and resolvers
│   ├── project/                     ← project definitions and resolvers
│   ├── status/                      ← status column definitions and resolvers
│   ├── task/                        ← task core logic, schemas, and resolvers
│   │   ├── @types/                  ← TS interfaces
│   │   ├── db/
│   │   │   ├── definitions/         ← Mongoose schemas (task.ts, cycle.ts)
│   │   │   └── models/              ← classes with business methods
│   │   ├── graphql/
│   │   │   ├── schemas/             ← task.ts, triage.ts
│   │   │   └── resolvers/
│   │   │       ├── queries/         ← taskQueries resolver index
│   │   │       └── mutations/       ← taskMutations resolver index
│   │   └── trpc/                    ← procedure files
│   ├── team/                        ← team definitions and schemas
│   └── template/                    ← templates definitions and resolvers
└── meta/
    ├── permissions.ts               ← RBAC permissions matrix
    └── notifications.ts             ← notification triggers and events
```

## Frontend (`frontend/plugins/operation_ui/`)

```
src/
├── bootstrap.tsx                    ← React mount
├── config.tsx                       ← Module Federation expose: name, icon, navigation, modules[], widgets
├── modules/
│   ├── OperationMain.tsx            ← routes switch entry
│   ├── OperationSettings.tsx        ← settings landing page
│   ├── OperationSettingsNavigation.tsx
│   ├── task/                        ← task list & detail views
│   │   ├── components/              ← board views, status columns, Zod form schemas
│   │   ├── hooks/                   ← useGetTasks, useCreateTask, useUpdateTask
│   │   ├── states/                  ← Jotai atoms
│   │   └── types/                   ← TS types
│   ├── project/                     ← project list & layout views
│   │   ├── components/              ← project headers, layout tabs
│   │   └── hooks/                   ← useGetProjects, useCreateProject, useUpdateProject
│   ├── cycle/                       ← cycles planning views
│   ├── team/                        ← teams navigation & lists
│   ├── template/                    ← templates UI
│   ├── triage/                      ← triage boards UI
│   └── navigation/                  ← navigation menu item registrations
```

## How modules talk to each other

- `task` tasks belong to a `project` and can be grouped under a `milestone` or `cycle`.
- `status` defines the columns on the `task` board.
- `team` scopes tasks and projects to specific departments/units.
- `note` provides conversations/comments inside the `task` sidebar.

## How operation talks to other plugins

- `core` — Users (assigned members), Companies, Tags.
- `sales` — Tasks can be linked to Deals via custom fields.
- `frontline` — Tasks can be linked to Conversations and Tickets.
