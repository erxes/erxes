import { z } from 'zod';
import { ActivityGetterInput } from '../../core-modules/logs/zodSchemas';

interface TActivityLogsRule {
  activityType: string;
  updatedFields?: string[];
  removedFields?: string[];
}

export type TActivityLogContext = {
  subdomain: string;
};

export interface TActivityEntityPayload<TData = any> {
  moduleName?: string;
  collectionName?: string;
  text: string;
  data?: TData;
}

const ActivityGetterResponseSchema = z.object({
  targetType: z.string(),
  target: z.object({
    moduleName: z.string(),
    collectionName: z.string(),
    text: z.string().optional(),
    data: z.any().optional(),
  }),
  contextType: z.string(),
  context: z.object({
    moduleName: z.string().optional(),
    collectionName: z.string().optional(),
    text: z.string(),
    data: z.any().optional().optional(),
  }),
  action: z.object({
    type: z.string(),
    description: z.string(),
  }),
  changes: z.any().optional(),
  metadata: z.any().optional(),
});

export type TActivityGetterResponse = z.infer<
  typeof ActivityGetterResponseSchema
>;

export type TActivityLogConfigs = {
  rules: TActivityLogsRule[];
  activityGetter: (
    args: z.infer<typeof ActivityGetterInput>,
    context: TActivityLogContext,
  ) => Promise<TActivityGetterResponse | TActivityGetterResponse[]>;
};
