import { z } from 'zod';
import { mainSettingsSchema } from '../constants/mainSettingsSchema';
import type {
  TSyncDealConfigFormValues,
  TSyncDealMovementConfigFormValues,
  TSyncDealReturnConfigFormValues,
  TSyncOrderConfigFormValues,
} from '@/settings/syncSettings/syncConfigSchema';

export type TMainConfig = z.infer<typeof mainSettingsSchema>;

export type TSyncConfigValue = Partial<
  TSyncDealConfigFormValues &
    TSyncDealReturnConfigFormValues &
    TSyncDealMovementConfigFormValues &
    TSyncOrderConfigFormValues
>;

export interface IConfig {
  _id: string;
  code: keyof TMainConfig;
  subId?: string;
  value: TSyncConfigValue;
}
