import { z } from 'zod';
import { Weekday } from '@/integrations/erxes-messenger/types/Weekday';
import { EnumResponseRate } from '@/integrations/erxes-messenger/types/ResponseRate';

export const ONLINE_HOURS_SCHEMA = z.object({
  work: z.boolean().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const EMHOURS_SCHEMA = z.object({
  availabilityMethod: z.enum(['manual', 'auto']),
  isOnline: z.boolean().optional(),
  onlineHours: z.record(z.nativeEnum(Weekday), ONLINE_HOURS_SCHEMA).optional(),
  responseRate: z.nativeEnum(EnumResponseRate),
  timezone: z.string().optional(),
  displayOperatorTimezone: z.boolean().optional(),
  hideMessengerDuringOfflineHours: z.boolean().optional(),
});
