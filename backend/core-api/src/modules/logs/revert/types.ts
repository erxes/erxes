import { z } from 'zod';

/**
 * Shared shapes for point-in-time revert. The InverseOp here mirrors the union
 * produced by computeInverse, re-expressed as a zod schema so it can cross the
 * TRPC boundary (remote plugins) with validation and so the same applier can be
 * driven locally and remotely.
 */

export const inverseInsertSchema = z.object({
  kind: z.literal('insert'),
  contentType: z.string(),
  docId: z.string(),
  mongooseName: z.string(),
  document: z.record(z.unknown()),
});

export const inverseDeleteSchema = z.object({
  kind: z.literal('delete'),
  contentType: z.string(),
  docId: z.string(),
  mongooseName: z.string(),
  // The snapshot the original `create` produced. When present, the delete-inverse
  // only removes the doc if the live doc still matches it — never destroys an
  // intervening change. Absent => delete unconditionally (best effort).
  expectDocument: z.record(z.unknown()).optional(),
});

export const inverseUpdateSchema = z.object({
  kind: z.literal('update'),
  contentType: z.string(),
  docId: z.string(),
  mongooseName: z.string(),
  set: z.record(z.unknown()),
  unset: z.array(z.string()),
});

export const applyWriteInputSchema = z.discriminatedUnion('kind', [
  inverseInsertSchema,
  inverseDeleteSchema,
  inverseUpdateSchema,
]);

export type ApplyWriteInput = z.infer<typeof applyWriteInputSchema>;

/** Result of applying (or attempting to apply) one inverse op. */
export type ApplyWriteResult =
  | { ok: true }
  | { ok: false; conflict: true; reason: string; liveState?: unknown };

/** Field-level conflict surfaced for the merge-style resolution UX. */
export interface FieldConflict {
  field: string;
  // The value the revert wants to restore (from the recorded prev state).
  revertValue: unknown;
  // The intervening live value that diverged from the recorded after-image.
  currentValue: unknown;
}

export interface DocConflict {
  contentType: string;
  docId: string;
  mongooseName: string;
  fields: FieldConflict[];
}

/** An entry that cannot be reverted automatically (surfaced, never applied). */
export interface UnrevertableEntry {
  contentType?: string;
  docId?: string;
  action: string;
  reason: string;
}

/**
 * Per-field resolution choice for a conflicted doc. Modeled on the existing
 * erxes merge flow (customersMerge/companiesMerge), but typed for a 3-way
 * revert: restore the recorded prev, keep the live value, or use a custom one.
 */
export type RevertResolutionMode = 'restore' | 'keep' | 'custom';

export interface RevertFieldResolution {
  field: string;
  mode: RevertResolutionMode;
  // Required only when mode === 'custom'.
  value?: unknown;
}

export interface RevertDocResolution {
  contentType: string;
  docId: string;
  fields: RevertFieldResolution[];
}

export interface RevertProcessResult {
  processId: string;
  requestProcessId: string;
  dryRun: boolean;
  // Inverse ops that would apply / did apply cleanly.
  reverted: Array<{ contentType: string; docId: string; kind: string }>;
  // Conflicted docs awaiting a resolution (skipped unless resolved).
  conflicts: DocConflict[];
  // Entries that cannot be auto-reverted (e.g. hard delete with no snapshot).
  unrevertable: UnrevertableEntry[];
  // True when the process was already reverted (idempotency marker found).
  alreadyReverted: boolean;
}
