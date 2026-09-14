import type { Model } from 'mongoose';
import type {
  IViberOutboxDocument,
  IViberReceiptDocument,
  IViberSubscriptionDocument,
} from '@/integrations/viber/@types/transport';
import {
  viberOutboxSchema,
  viberReceiptSchema,
  viberSubscriptionSchema,
} from '@/integrations/viber/db/definitions/transport';

export type IViberOutboxModel = Model<IViberOutboxDocument>;
export type IViberReceiptModel = Model<IViberReceiptDocument>;
export type IViberSubscriptionModel = Model<IViberSubscriptionDocument>;
export const loadViberOutboxClass = () => viberOutboxSchema;
export const loadViberReceiptClass = () => viberReceiptSchema;
export const loadViberSubscriptionClass = () => viberSubscriptionSchema;
