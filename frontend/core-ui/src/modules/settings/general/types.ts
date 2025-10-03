import { z } from 'zod';
import { generalSettingsSchema } from './schema';

export type TGeneralSettingsProps = z.infer<typeof generalSettingsSchema>;
export interface TLanguage {
  label: string;
  value: string;
}
