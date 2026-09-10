import type { Model } from 'mongoose';
import type { IViberCustomerDocument } from '@/integrations/viber/@types/customer';
import { viberCustomerSchema } from '@/integrations/viber/db/definitions/customers';

export type IViberCustomerModel = Model<IViberCustomerDocument>;

export const loadViberCustomerClass = () => viberCustomerSchema;
