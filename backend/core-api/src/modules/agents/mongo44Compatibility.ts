// MongoDB 4.4.25 compatible
// Temporary workflow-storage boundary. Remove the installation in memory.ts and
// this file only after encoded suspended runs have completed (see AGENTS.md).
import type { WorkflowsStorage } from '@mastra/core/storage' with {
  'resolution-mode': 'import',
};

type WorkflowStorage = Pick<WorkflowsStorage,
  'persistWorkflowSnapshot' | 'updateWorkflowResults' | 'updateWorkflowState' |
  'loadWorkflowSnapshot' | 'listWorkflowRuns' | 'getWorkflowRunById'>;

// MongoDB 4.4.25 compatible
const ENVELOPE = '__erxesMongo44Entries_v1';
// MongoDB 4.4.25 compatible
const installed = new WeakSet<WorkflowStorage>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === 'object' &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);

// Encode only objects with Mongo-incompatible keys. Safe snapshot fields stay
// queryable, including status, context, resourceId and timestamps. BSON values
// (Date, Buffer, ObjectId, etc.) pass through unchanged; inputs are never mutated.
// MongoDB 4.4.25 compatible
export const encodeMongo44Snapshot = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(encodeMongo44Snapshot);
  if (!isRecord(value)) return value;
  const entries = Object.entries(value);
  if (entries.some(([key]) => key.startsWith('$') || key.includes('.') || key === ENVELOPE)) {
    return {
      [ENVELOPE]: entries.map(([key, entry]) => [
        Buffer.from(key).toString('base64'),
        encodeMongo44Snapshot(entry),
      ]),
    };
  }
  return Object.fromEntries(entries.map(([key, entry]) => [key, encodeMongo44Snapshot(entry)]));
};

// MongoDB 4.4.25 compatible
export const decodeMongo44Snapshot = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(decodeMongo44Snapshot);
  if (!isRecord(value)) return value;
  const entries = value[ENVELOPE];
  if (Object.keys(value).length === 1 && Array.isArray(entries) &&
    entries.every((entry: unknown) => Array.isArray(entry) && entry.length === 2 && typeof entry[0] === 'string')) {
    return Object.fromEntries(entries.map(([key, entry]: [string, unknown]) => [
      Buffer.from(key, 'base64').toString(),
      decodeMongo44Snapshot(entry),
    ]));
  }
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, decodeMongo44Snapshot(entry)]));
};

// The casts are confined to the external storage boundary: Mastra's public types
// describe decoded snapshots, while Mongo receives the reversible encoded form.
// MongoDB 4.4.25 compatible
const compatibleMethod = <Args extends unknown[], Result>(
  method: (...args: Args) => Promise<Result>,
  encode: boolean,
): ((...args: Args) => Promise<Result>) => async (...args) => {
  const storedArgs = encode ? encodeMongo44Snapshot(args) as Args : args;
  return decodeMongo44Snapshot(await method(...storedArgs)) as Result;
};

// MongoDB 4.4.25 compatible
export const installMongo44WorkflowCompatibility = (
  workflows: WorkflowStorage,
): void => {
  if (installed.has(workflows)) return;
  workflows.persistWorkflowSnapshot = compatibleMethod(workflows.persistWorkflowSnapshot.bind(workflows), true);
  workflows.updateWorkflowResults = compatibleMethod(workflows.updateWorkflowResults.bind(workflows), true);
  workflows.updateWorkflowState = compatibleMethod(workflows.updateWorkflowState.bind(workflows), true);
  workflows.loadWorkflowSnapshot = compatibleMethod(workflows.loadWorkflowSnapshot.bind(workflows), false);
  workflows.listWorkflowRuns = compatibleMethod(workflows.listWorkflowRuns.bind(workflows), false);
  workflows.getWorkflowRunById = compatibleMethod(workflows.getWorkflowRunById.bind(workflows), false);
  installed.add(workflows);
};
