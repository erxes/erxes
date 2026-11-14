// Which Mongo field goes to which column, per collection, for scripts/import-mongo.ts.
// Written by migration/checklist.ts; edit it as the tables in api/src/db/schema.ts change.
export const IMPORT_MAP: { collection: string; table: string; columns: Record<string, string> }[] =
  [];
