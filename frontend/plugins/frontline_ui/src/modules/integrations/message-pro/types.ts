import { z } from 'zod';
import { MESSAGE_PRO_CONFIG_SCHEMA } from './schema/config';

export type TMessageProConfig = z.infer<typeof MESSAGE_PRO_CONFIG_SCHEMA>;

export interface IConfigItem {
  _id: string;
  code: string;
  value: string;
  ___typename: string;
}
