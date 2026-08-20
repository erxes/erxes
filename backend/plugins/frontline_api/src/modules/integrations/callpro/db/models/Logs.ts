import { Model } from 'mongoose';
import { callProLogSchema } from '@/integrations/callpro/db/definitions/logs';
import { ICallProLogDocument } from '@/integrations/callpro/@types/logs';

export type ICallProLogModel = Model<ICallProLogDocument>;

export const loadCallProLogClass = () => callProLogSchema;
