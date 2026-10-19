import { z } from 'zod';

export type ExtensionVersion = {
  version: string;
  installedAt: string;
};

export type Extension = {
  extId: string;
  version: string;
  status: 'installed' | 'disabled';
  versions: ExtensionVersion[];
  // collection -> document count
  documents: Record<string, number>;
  // Hosts it may fetch over https.
  network?: string[];
  // secret name -> description
  secrets?: Record<string, string>;
};

// One declared secret. The runtime never sends its value.
export type ExtensionSecret = {
  name: string;
  description: string;
  set: boolean;
  updatedAt: string | null;
};

export type ExtensionRun = {
  _id: string;
  version: string;
  fn: string;
  status: 'ok' | 'error' | 'timeout';
  error?: { code: string; message: string };
  ms: number;
  createdAt: string;
};

// A host contract version the runtime serves.
export type ExtensionContract = {
  host: string;
  version: number;
  entries: { name: string; kind: string; description: string }[];
};

// The parts of a built `.erxext.json` the owner approves before installing.
// The runtime validates the whole bundle; this only reads what to show.
export const ExtensionBundle = z.object({
  id: z.string(),
  version: z.string(),
  // module -> action -> title
  permissions: z.record(z.record(z.string())).default({}),
  // host contract -> pinned version, e.g. { sales: 1 }
  uses: z.record(z.number()).default({}),
  // Hosts it may fetch over https, e.g. ['api.github.com', '*.slack.com']
  network: z.array(z.string()).default([]),
  // secret name -> description
  secrets: z.record(z.string()).default({}),
});

export type ExtensionBundle = z.infer<typeof ExtensionBundle>;
