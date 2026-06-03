# Backend Plugin Rules

## Project Shape

```bash
module_name/
├── db/        # Database models and connections
├── graphql/   # GraphQL schema, queries and mutations
├── @types/    # TypeScript interfaces and types
├── utils/     # Utility functions
├── trpc/      # tRPC routers and procedures
├── routes/    # Express routes
```

**routes**: A file that collects all separated routes for each module.

## Join Gateway

Provide the plugin name and the port it runs on. This information is stored by the plugin in Redis, and the gateway and other plugins retrieve it from Redis.

## Imports

- `~/` means importing from the `src` directory.
- `@/` means importing from the current module.

## Apollo (GraphQL)

### Schema & Query Rules

When defining a schema, you must declare `(keyfield: "_id")`.
All list responses must include both `list` and `totalCount`.
When providing context, use `expressMiddleware`.

### Express Middleware

Connect the created Apollo Server with the Express app to handle requests.

## Mongoose Models

In the definition section, if you set `"timestamps: true"`, `createdAt` and `updatedAt` will be automatically generated.
IDs must always be indexed.

## tRPC

```ts
const prevMessage = await sendTRPCMessage({
  subdomain,
  pluginName: 'frontline', // plugin name
  method: 'query', // specifies the type of operation to perform
  module: 'conversationMessages', // specifies exactly which module
                                  // within the plugin to access
  action: 'findOne', // specifies the function/operation to run
                     // within that module
  input: query, // filter used for querying
});
```

## Pagination

When returning a list, you must always return `totalCount` and `pageInfo` in addition to the list data.
Use the `cursorPaginate` function for all lists.

## Plugin Development

- You cannot use duplicate ports when creating a new plugin.
- Specify the plugin name to be enabled in `.env`.

### Required Bootstrap Export

Every backend plugin must export a `startPlugin()` function that returns an object containing:

- **graphql** — GraphQL schema (or schema factory)
- **expressRouter** — Express Router instance
- **trpcAppRouter** — tRPC router
- **meta** — Plugin metadata configuration

## Warnings

- Avoid using the `any` type as much as possible.
- Always use absolute paths for imports (e.g., `~/`, `@/`).
- Avoid adding modifications directly to core; prefer extending instead.
