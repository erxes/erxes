import { z } from 'zod';
import { mainSettingsSchema } from '../constants/mainSettingsSchema';

export type TMainConfig = z.infer<typeof mainSettingsSchema>;

export interface IConfig {
  _id: string;
  code: keyof TMainConfig;
  subId?: string;
  value: any;
}
