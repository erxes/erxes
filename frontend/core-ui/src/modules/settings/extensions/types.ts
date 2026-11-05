import { z } from 'zod';

export type ExtensionVersion = {
  version: string;
  installedAt: string;
};

// One install as the runtime's `GET /installed` lists it.
export type Extension = {
  extId: string;
  version: string;
  status: 'installed' | 'disabled';
  versions: ExtensionVersion[];
  // collection -> document count
  documents: Record<string, number>;
};

// One persisted GraphQL operation, as the runtime's `POST /operations`
// summarizes it: a query reads, a mutation writes, and a write whose root
// field removes, deletes, merges or destroys is destructive.
export type ExtensionOperation = {
  hash: string;
  name: string;
  kind: 'read' | 'write' | 'destructive';
  fields: string[];
};

// The parts of a built `.erxext.json` the owner approves before installing.
// The runtime validates the whole bundle; this only reads what to show.
export const ExtensionBundle = z.object({
  id: z.string(),
  version: z.string(),
  collections: z.array(z.string()).default([]),
  // module -> action -> title
  permissions: z
    .record(z.string(), z.record(z.string(), z.string()))
    .default({}),
  // sha256 -> GraphQL document
  operations: z.record(z.string(), z.string()).default({}),
  ui: z.object({ remote: z.string() }).optional(),
});

export type ExtensionBundle = z.infer<typeof ExtensionBundle>;
