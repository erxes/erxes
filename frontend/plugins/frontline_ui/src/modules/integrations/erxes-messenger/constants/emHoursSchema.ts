import { z } from 'zod';
import { Weekday } from '@/integrations/erxes-messenger/types/Weekday';
import { EnumResponseRate } from '@/integrations/erxes-messenger/types/ResponseRate';

export enum ScheduleDay {
  DAILY = 'everyday',
  WEEKDAY = 'weekday',
  WEEKEND = 'weekend',
}
export const ONLINE_HOURS_SCHEMA = z.object({
  work: z.boolean().optional().catch(false),
  from: z.string().optional().catch(''),
  to: z.string().optional().catch(''),
});

export const EMHOURS_SCHEMA = z.object({
  availabilityMethod: z.enum(['manual', 'auto']).optional().catch('manual'),
  isOnline: z.boolean().optional().catch(false),
  onlineHours: z
    .record(z.nativeEnum({ ...Weekday, ...ScheduleDay }), ONLINE_HOURS_SCHEMA)
    .optional()
    .catch(undefined),
  responseRate: z
    .nativeEnum(EnumResponseRate)
    .optional()
    .catch(EnumResponseRate.MINUTES),
  timezone: z.string().optional().catch(undefined),
  displayOperatorTimezone: z.boolean().optional().catch(false),
  hideMessengerDuringOfflineHours: z.boolean().optional().catch(false),
});
