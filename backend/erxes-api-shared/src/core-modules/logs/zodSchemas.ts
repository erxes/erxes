import { TActivityLogProducers } from './types';
import { z } from 'zod';

export function createActivityGetterInputDataSchema<
  TTarget extends z.ZodTypeAny = z.ZodAny,
>(documentSchema: TTarget = z.any() as unknown as TTarget) {
  return z.object({
    pluginName: z.string(),
    moduleName: z.string(),
    collectionName: z.string(),
    activityType: z.string(),
    fullDocument: documentSchema,
    prevDocument: documentSchema.optional(),
    updateDescription: z.object({
      updatedFields: z.record(z.string(), z.any()),
      removedFields: z.array(z.string()),
    }),
  });
}

export const ActivityGetterInputData = createActivityGetterInputDataSchema();

export const ActivityGetterInput = z.object({
  subdomain: z.string(),
  data: ActivityGetterInputData,
});

export type TActivityGetterInput = z.infer<typeof ActivityGetterInput>;

export type TActivityGetterInputData<TTarget = any> = {
  pluginName: string;
  moduleName: string;
  collectionName: string;
  activityType: string;
  fullDocument: TTarget;
  prevDocument?: TTarget;
  updateDescription: {
    updatedFields: Record<string, any>;
    removedFields: string[];
  };
};
export type TActivityLogProducersInput = {
  [TActivityLogProducers.ACTIVITY_GETTER]: TActivityGetterInputData;
};
