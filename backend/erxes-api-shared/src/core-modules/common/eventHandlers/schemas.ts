import { z } from 'zod';

const CreateLogSchema = z.object({
  action: z.literal('create'),
  docId: z.string(),
  currentDocument: z.any(),
  prevDocument: z.any().optional(),
});

const UpdateLogSchema = z.object({
  action: z.literal('update'),
  docId: z.string(),
  currentDocument: z.any(),
  prevDocument: z.any(),
});

const DeleteLogSchema = z.object({
  action: z.literal('delete'),
  docId: z.string(),
  // The document as it was just before deletion. Optional for backward
  // compatibility; when supplied it makes the delete reversible (point-in-time
  // revert re-inserts it, preserving the original _id).
  prevDocument: z.any().optional(),
});

const DeleteManyLogSchema = z.object({
  action: z.literal('deleteMany'),
  docIds: z.array(z.string()),
  // Prior documents (any order; matched to docIds by _id). Optional; enables
  // revert by re-inserting each deleted doc with its original _id.
  prevDocuments: z.array(z.any()).optional(),
});

const UpdateManyLogSchema = z.object({
  action: z.literal('updateMany'),
  docIds: z.union([z.string(), z.array(z.string())]),
  updateDescription: z.record(z.any()),
});

const BulkWriteLogSchema = z.object({
  action: z.literal('bulkWrite'),
  docIds: z.union([z.string(), z.array(z.string())]),
  updateDescription: z.record(z.any()),
});

export const LogEventSchema = z.union([
  CreateLogSchema,
  UpdateLogSchema,
  DeleteLogSchema,
  DeleteManyLogSchema,
  UpdateManyLogSchema,
  BulkWriteLogSchema,
]);

export type LogEventInput = z.infer<typeof LogEventSchema>;
