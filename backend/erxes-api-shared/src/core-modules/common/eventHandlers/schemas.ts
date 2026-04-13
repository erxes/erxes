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
});

const DeleteManyLogSchema = z.object({
  action: z.literal('deleteMany'),
  docIds: z.array(z.string()),
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
