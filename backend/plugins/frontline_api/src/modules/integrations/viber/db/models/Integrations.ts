import type { Model } from 'mongoose';
import type { IViberIntegrationDocument } from '@/integrations/viber/@types/integration';
import { viberIntegrationSchema } from '@/integrations/viber/db/definitions/integrations';

export type IViberIntegrationModel = Model<IViberIntegrationDocument>;

export const loadViberIntegrationClass = () => viberIntegrationSchema;
