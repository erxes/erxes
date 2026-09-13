import type { Model } from 'mongoose';
import type { IViberMessageDocument } from '@/integrations/viber/@types/message';
import { viberMessageSchema } from '@/integrations/viber/db/definitions/messages';

export type IViberMessageModel = Model<IViberMessageDocument>;

export const loadViberMessageClass = () => viberMessageSchema;
