import { z } from 'zod';
import { WorkDay } from '@/settings/structure/types/workhours';

const timeSchema = z.string().optional();

const WORK_HOURS_SCHEMA = z
  .object({
    inactive: z.boolean().default(true).optional(),
    startFrom: timeSchema,
    endTo: timeSchema,
    lunchStartFrom: timeSchema,
    lunchEndTo: timeSchema,
  })
  .optional()
  .nullable();

export const WORKING_HOURS_SCHEMA = z.object(
  Object.values(WorkDay).reduce((acc, day) => {
    (acc as Record<string, any>)[day] = WORK_HOURS_SCHEMA;
    return acc;
  }, {} as Record<string, any>),
);
