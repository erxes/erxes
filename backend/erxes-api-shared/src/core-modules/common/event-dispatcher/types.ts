import { z } from 'zod';

export enum DbLogActions {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPDATE_MANY = 'updateMany',
  BULK_WRITE = 'bulkWrite',
  DELETE_MANY = 'deleteMany',
}

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

export type EventPayload = {
  docIds?: string | string[];
  docId?: string;
  updateDescription?: Record<string, any>;
  processId?: string;
  userId?: string;
  source: string;
  action: string;
  status: string;
  contentType: string;
  subdomain: string;
  payload?: any;
};

export type ActivityLogInput = {
  activityType: string;
  target: any;
  context?: any;
  action: any;
  changes: any;
  metadata?: any;
};
