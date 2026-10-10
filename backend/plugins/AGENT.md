# Backend Plugin Development Guide

This document defines the architecture, conventions, and best practices for developing backend plugins in the erxes ecosystem.

## Table of Contents

- [Project Structure](#project-structure)
- [Bootstrap & Entrypoint](#bootstrap--entrypoint)
- [Database Layer](#database-layer)
- [GraphQL Layer](#graphql-layer)
- [tRPC Layer](#trpc-layer)
- [Express Routes](#express-routes)
- [Meta System](#meta-system)
- [Import/Export](#importexport)
- [Background Workers](#background-workers)
- [Inter-Plugin Communication](#inter-plugin-communication)
- [Migrations](#migrations)
- [Imports & Aliases](#imports--aliases)
- [Development Rules](#development-rules)

---

## Project Structure

A backend plugin follows this directory layout:

```text
plugin_name_api/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── src/
│   ├── main.ts                    # Plugin entrypoint — calls startPlugin()
│   ├── connectionResolvers.ts     # Database connection & model registry
│   ├── apollo/
│   │   ├── typeDefs.ts            # GraphQL type definitions assembly
│   │   ├── resolvers/
│   │   │   ├── index.ts           # Resolver aggregation
│   │   │   ├── queries.ts         # Query resolvers
│   │   │   ├── mutations.ts       # Mutation resolvers
│   │   │   └── resolvers.ts       # Custom type resolvers
│   │   ├── schema/                # Per-module schema fragments
│   │   └── subscription.ts        # GraphQL subscriptions (optional)
│   ├── trpc/
│   │   ├── init-trpc.ts           # tRPC router initialization
│   │   └── trpcClients.ts         # Cross-plugin tRPC clients (optional)
│   ├── modules/
│   │   └── module_name/
│   │       ├── @types/            # TypeScript interfaces (deprecated, use types.ts)
│   │       ├── types.ts           # Domain types & interfaces
│   │       ├── db/
│   │       │   ├── definitions/   # Mongoose schema definitions
│   │       │   └── models/        # Mongoose model classes
│   │       ├── graphql/
│   │       │   ├── schemas/       # GraphQL type/query/mutation strings
│   │       │   └── resolvers/     # Module-specific resolvers (optional)
│   │       └── trpc/              # Module-specific tRPC routers (optional)
│   ├── routes.ts                  # Express route aggregation (optional)
│   ├── meta/
│   │   ├── permissions.ts         # Permission definitions
│   │   ├── notifications.ts       # Notification templates
│   │   ├── automations.ts         # Automation configs (optional)
│   │   ├── afterProcess.ts        # Post-processing hooks (optional)
│   │   └── import-export/         # Import/export handlers (optional)
│   ├── utils/                     # Plugin-specific utilities
│   ├── worker/                    # Background job handlers (optional)
│   └── migrations/                # Database migrations (optional)
```

**Key principles:**
- Each module inside `modules/` is self-contained with its own types, DB layer, and GraphQL schema
- `connectionResolvers.ts` is the single source of truth for model registration
- `main.ts` is the only file that calls `startPlugin()`

---

## Bootstrap & Entrypoint

Every backend plugin must have a `src/main.ts` that calls `startPlugin()` from `erxes-api-shared/utils`.

### startPlugin Configuration

```ts
import { startPlugin } from 'erxes-api-shared/utils';
import { Router } from 'express';
import { typeDefs } from '~/apollo/typeDefs';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { appRouter } from '~/trpc/init-trpc';
import { router } from '~/routes';
import { permissions } from './meta/permissions';
import { notifications } from './meta/notifications';

startPlugin({
  // Required
  name: 'operation',           // Unique plugin identifier
  port: 3307,                  // Unique port (check existing plugins)
  
  // GraphQL
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  
  // Apollo context — injects models into GraphQL context
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);
    context.models = models;
    return context;
  },
  
  // Express routes (optional)
  expressRouter: router,
  
  // tRPC router (optional)
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);
      context.models = models;
      return context;
    },
  },
  
  // Subscriptions (optional)
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'apollo',
    process.env.NODE_ENV === 'production' ? 'subscription.js' : 'subscription.ts',
  ),
  
  // Server init hook (optional) — include all startup tasks in one hook
  onServerInit: async (app) => {
    // Initialize external services, websockets, etc.
    await initMQWorkers(redis);
  },
  
  // Import/Export (optional)
  importExport: {
    import: {
      types: [{ label: 'Ticket', contentType: 'frontline:ticket.ticket' }],
      insertImportRows: createCoreModuleProducerHandler({...}),
      getImportHeaders: createCoreModuleProducerHandler({...}),
    },
    export: {
      types: [{ label: 'Ticket', contentType: 'frontline:ticket.ticket' }],
      getExportData: createCoreModuleProducerHandler({...}),
      getExportHeaders: createCoreModuleProducerHandler({...}),
    },
  },
  
  // Metadata
  meta: {
    permissions,
    notifications,
    tags: {
      types: [
        { description: 'Task', type: 'task' },
      ],
    },
    properties: {
      types: [
        { description: 'Task', type: 'task' },
      ],
    },
    automations,      // Optional
    afterProcess,     // Optional
  },
});
```

### Port Allocation

Existing plugin ports (do not duplicate):

| Plugin | Port |
|--------|------|
| content | 3303 |
| frontline | 3304 |
| operation | 3307 |
| sales | 3308 |
| payment | 3309 |
| posclient | 3310 |
| loyalty | 3311 |
| insurance | 3312 |
| tourism | 3313 |
| accounting | 3314 |
| mongolian | 3315 |

---

## Database Layer

### Mongoose Schema Definitions

Define schemas in `modules/<module>/db/definitions/<entity>.ts`:

```ts
import { Schema } from 'mongoose';

export const taskSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    statusId: { type: Schema.Types.ObjectId },
    assignedTo: { type: [String], default: [] },
    createdBy: { type: String },
    teamId: { type: String },
  },
  {
    timestamps: true,  // Auto-generates createdAt and updatedAt
  },
);
```

**Rules:**
- Always set `timestamps: true` in schema options
- Always index `_id` fields and frequently queried fields
- Use `Schema.Types.ObjectId` for references to other documents
- Keep definitions pure — no methods, no business logic

### Model Classes

Implement business logic in `modules/<module>/db/models/<entity>.ts` using `loadClass()`:

```ts
import { taskSchema } from '@/task/db/definitions/task';
import { ITask, ITaskDocument } from '@/task/types';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ITaskModel extends Model<ITaskDocument> {
  getTask(_id: string): Promise<ITaskDocument>;
  getTasks(filter: FilterQuery<ITaskDocument>): Promise<ITaskDocument[]>;
  createTask(doc: ITask): Promise<ITaskDocument>;
  updateTask(doc: ITaskDocument): Promise<ITaskDocument>;
  removeTask(_id: string): Promise<{ ok: number }>;
}

export const loadTaskClass = (models: IModels) => {
  class Task {
    public static async getTask(_id: string) {
      const task = await models.Task.findOne({ _id }).lean();
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    }

    public static async getTasks(
      filter: FilterQuery<ITaskDocument>,
    ): Promise<ITaskDocument[]> {
      return models.Task.find(filter);
    }

    public static async createTask(doc: ITask): Promise<ITaskDocument> {
      return models.Task.create(doc);
    }

    public static async updateTask(doc: ITaskDocument) {
      const { _id, ...rest } = doc;
      return models.Task.findOneAndUpdate({ _id }, { $set: { ...rest } });
    }

    public static async removeTask(_id: string) {
      return models.Task.deleteOne({ _id });
    }
  }

  return taskSchema.loadClass(Task);
};
```

**Rules:**
- Export an interface `<Entity>Model` extending `Model<Document>` with static method signatures
- Export `load<Entity>Class(models: IModels)` that returns `schema.loadClass(Class)`
- Use `models` parameter to access other models for cross-module queries
- Always throw meaningful errors when entities are not found

### Type Definitions

Define domain types in `modules/<module>/types.ts`:

```ts
import { Model, Document } from 'mongoose';

export interface ITask {
  name: string;
  description?: string;
  statusId?: string;
  assignedTo?: string[];
  createdBy?: string;
  teamId?: string;
}

export interface ITaskDocument extends ITask, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskModel = Model<ITaskDocument>;
```

### Connection Resolvers

Register all models in `src/connectionResolvers.ts`:

```ts
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';

import { ITaskModel, loadTaskClass } from '@/task/db/models/Task';
import { ITaskDocument } from '@/task/types';

export interface IModels {
  Task: ITaskModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Task = db.model<ITaskDocument, ITaskModel>(
    'operation_tasks',      // Collection name: prefix with plugin name
    loadTaskClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
```

**Rules:**
- Collection names must be prefixed with the plugin name (e.g., `operation_tasks`, `frontline_conversations`)
- `IModels` interface lists all available models
- `IContext` extends `IMainContext` and injects `models`
- Use `createGenerateModels()` from `erxes-api-shared/utils` for model caching per subdomain

---

## GraphQL Layer

### Schema Definition Pattern

Define per-module schemas in `modules/<module>/graphql/schemas/<entity>.ts`:

```ts
export const types = `
  type Task {
    _id: String
    name: String
    description: String
    statusId: String
    assignedTo: [String]
    createdBy: String
    teamId: String
    createdAt: String
    updatedAt: String
  }
`;

const createTaskParams = `
  name: String!
  description: String
  statusId: String
  assignedTo: [String]
  teamId: String
`;

const updateTaskParams = `
  _id: String!
  name: String
  description: String
  statusId: String
  assignedTo: [String]
`;

export const queries = `
  task(_id: String!): Task
  tasks(
    statusId: String
    teamId: String
    assignedTo: [String]
    page: Int
    perPage: Int
  ): [Task]
`;

export const mutations = `
  createTask(${createTaskParams}): Task
  updateTask(${updateTaskParams}): Task
  deleteTask(_id: String!): JSON
`;
```

**Rules:**
- Always include `createdAt` and `updatedAt` fields in type definitions
- Use `String` for IDs, not `ID` or `ObjectId`
- Use `JSON` scalar for flexible return types
- Export `types`, `queries`, and `mutations` as template literals

### Schema Aggregation

Aggregate all module schemas in `apollo/schema/schema.ts`:

```ts
import { types as TaskTypes, queries as TaskQueries, mutations as TaskMutations } from '@/task/graphql/schemas/task';

export const types = `
  ${TaskTypes}
`;

export const queries = `
  ${TaskQueries}
`;

export const mutations = `
  ${TaskMutations}
`;

export default { types, queries, mutations };
```

### Type Definitions Assembly

Assemble the final GraphQL document in `apollo/typeDefs.ts`:

```ts
import { apolloCommonTypes } from 'erxes-api-shared/utils';
import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { mutations, queries, types } from '~/apollo/schema/schema';

export const typeDefs = async (): Promise<DocumentNode> => {
  return gql`
    ${apolloCommonTypes}
    ${types}
    
    extend type Query {
      ${queries}
    }
    extend type Mutation {
      ${mutations}
    }
  `;
};
```

### Resolvers

Aggregate resolvers in `apollo/resolvers/index.ts`:

```ts
import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { customResolvers } from './resolvers';
import { mutations } from './mutations';
import { queries } from './queries';

const resolvers: any = {
  Mutation: { ...mutations },
  Query: { ...queries },
  ...apolloCustomScalars,
  ...customResolvers,
};

export default resolvers;
```

**Rules:**
- Query/mutation resolvers receive `(root, args, context, info)` — destructure `context` for `models` and `subdomain`
- Always use `context.models.<Model>` to access database models
- List queries must return `{ list: [], totalCount: number }` shape
- Use `@key(fields: "_id")` on entity types for Apollo Federation
- Use `expressMiddleware` for Apollo Server context binding

### Pagination

All list queries must use cursor-based pagination:

```ts
// Resolver
const tasks = async (_root, args, { models }) => {
  const { statusId, teamId, page = 1, perPage = 20 } = args;
  const filter = {};
  if (statusId) filter.statusId = statusId;
  if (teamId) filter.teamId = teamId;
  
  return models.Task.cursorPaginate(filter, { page, perPage });
};
```

Response shape:
```json
{
  "list": [...],
  "totalCount": 100,
  "pageInfo": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "startCursor": "...",
    "endCursor": "..."
  }
}
```

---

## tRPC Layer

### Router Initialization

Initialize tRPC in `trpc/init-trpc.ts`:

```ts
import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { taskTrpcRouter } from '~/modules/task/trpc/task';

export type PluginTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<PluginTRPCContext>().create();

export const appRouter = t.mergeRouters(
  t.router({
    plugin: {
      hello: t.procedure.query(() => 'Hello from plugin'),
    },
  }),
  taskTrpcRouter,
);

export type AppRouter = typeof appRouter;
```

**Rules:**
- Create a plugin-specific `TRPCContext` extending `ITRPCContext`
- Merge module-level routers into the main `appRouter`
- Export `AppRouter` type for type-safe clients

---

## Express Routes

Aggregate routes in `routes.ts`:

```ts
import { Router } from 'express';
import { router as facebookRouter } from './modules/integrations/facebook/routes';
import { router as instagramRouter } from './modules/integrations/instagram/routes';

export const router: Router = Router();

router.use('/facebook', facebookRouter);
router.use('/instagram', instagramRouter);
```

**Rules:**
- Export a single `router` from `routes.ts`
- Pass it to `startPlugin({ expressRouter: router })`
- Use module-level route files for specific endpoints

---

## Meta System

The `meta` object passed to `startPlugin()` registers plugin capabilities with the core system.

### Permissions

Define in `meta/permissions.ts`:

```ts
import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'operation',
  modules: [
    {
      name: 'task',
      description: 'Task management',
      scopeField: 'teamId',          // Field used for scope filtering
      ownerFields: ['createdBy', 'assignedTo'],
      scopes: [
        { name: 'own', description: 'Records user created or assigned to user' },
        { name: 'group', description: 'Records in user teams' },
        { name: 'all', description: 'All records' },
      ],
      actions: [
        { title: 'View tasks', name: 'taskRead', description: 'View tasks', always: true },
        { title: 'Create tasks', name: 'taskCreate', description: 'Create tasks' },
        { title: 'Edit tasks', name: 'taskUpdate', description: 'Edit tasks' },
        { title: 'Delete tasks', name: 'taskRemove', description: 'Delete tasks' },
      ],
    },
  ],
  defaultGroups: [
    {
      id: 'operation:admin',
      name: 'Operation Admin',
      description: 'Full access',
      permissions: [
        { plugin: 'operation', module: 'task', actions: ['taskRead', 'taskCreate', 'taskUpdate', 'taskRemove'], scope: 'all' },
      ],
    },
  ],
};
```

### Notifications

Define in `meta/notifications.ts`:

```ts
export const notifications = [
  {
    name: 'taskAssigned',
    label: 'Task assigned to you',
    description: 'When a task is assigned to you',
  },
];
```

### Tags & Properties

Register taggable and propertied types:

```ts
meta: {
  tags: {
    types: [
      { description: 'Task', type: 'task' },
    ],
  },
  properties: {
    types: [
      { description: 'Task', type: 'task' },
    ],
  },
}
```

---

## Import/Export

Plugins can register import/export handlers for bulk data operations:

```ts
import { createCoreModuleProducerHandler, TImportExportProducers } from 'erxes-api-shared/core-modules';

startPlugin({
  importExport: {
    import: {
      types: [{ label: 'Ticket', contentType: 'frontline:ticket.ticket' }],
      insertImportRows: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { ticket: ticketImportHandlers },
        methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
        extractModuleName: (input) => input.moduleName,
        generateModels,
      }),
    },
    export: {
      types: [{ label: 'Ticket', contentType: 'frontline:ticket.ticket' }],
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { ticket: ticketExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input) => input.moduleName,
        generateModels,
      }),
    },
  },
});
```

---

## Background Workers

Use BullMQ for background job processing:

```ts
import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';

export const initMQWorkers = async (redis: any) => {
  // Create a scheduled queue
  const myQueue = new Queue('plugin-daily-jobs', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  // Schedule recurring job
  await myQueue.upsertJobScheduler(
    'plugin-daily-jobs',
    { pattern: '0 * * * *', tz: 'UTC' },
    { name: 'plugin-daily-jobs' },
  );

  // Register worker handlers
  createMQWorkerWithListeners(
    'plugin',
    'dailyJob',
    dailyJobHandler,
    redis,
    () => console.log('Worker ready'),
  );
};
```

---

## Inter-Plugin Communication

### tRPC Calls

Call another plugin's tRPC procedures:

```ts
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const prevMessage = await sendTRPCMessage({
  subdomain,
  pluginName: 'frontline',        // Target plugin name
  method: 'query',                // 'query' or 'mutation'
  module: 'conversationMessages', // Target module
  action: 'findOne',              // Procedure name
  input: query,                   // Input payload
});
```

### Gateway Registration

Plugins register themselves with the gateway via Redis:
- On startup, `startPlugin()` publishes the plugin name and port to Redis
- The gateway discovers plugins by reading from Redis
- Other plugins use this registry for inter-plugin communication

---

## Migrations

Place database migrations in `src/migrations/`:

```ts
// src/migrations/migrateTasks.ts
import { generateModels } from '~/connectionResolvers';

export const migrateTasks = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  // Migration logic
  await models.Task.updateMany({}, { $set: { newField: 'default' } });
};
```

**Rules:**
- Migrations must be idempotent (safe to run multiple times)
- Name migrations descriptively with timestamps
- Document breaking changes in migration files

---

## Imports & Aliases

### Path Aliases

- `~/` — Alias for the `src` directory
- `@/` — Alias for the current module (e.g., `@/task/db/models/Task`)

### Import Examples

```ts
// From src root
import { typeDefs } from '~/apollo/typeDefs';
import { IModels } from '~/connectionResolvers';

// From current module
import { taskSchema } from '@/task/db/definitions/task';
import { ITask, ITaskDocument } from '@/task/types';

// From shared packages
import { startPlugin, createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext, IPermissionConfig } from 'erxes-api-shared/core-types';

// External libraries
import { Schema } from 'mongoose';
import { Router } from 'express';
```

**Rules:**
- Always use absolute paths (`~/`, `@/`) — never relative imports (`../../`)
- Never use `any` type — define proper interfaces
- Group imports: external libs → shared packages → internal aliases

---

## Development Rules

See [`rules/RULES.md`](./rules/RULES.md) for the complete list of mandatory development rules, port allocation table, and package.json template.
