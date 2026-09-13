import type { Model } from 'mongoose';
import type { IViberConversationDocument } from '@/integrations/viber/@types/conversation';
import { viberConversationSchema } from '@/integrations/viber/db/definitions/conversations';

export type IViberConversationModel = Model<IViberConversationDocument>;
export const loadViberConversationClass = () => viberConversationSchema;
