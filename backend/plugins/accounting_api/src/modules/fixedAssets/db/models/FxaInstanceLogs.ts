import { Model } from 'mongoose';
import { IFxaInstanceLogDocument } from '../../@types/fxaInstanceLog';
import { fxaInstanceLogSchema } from '../definitions/fxaInstanceLog';

export type IFxaInstanceLogModel = Model<IFxaInstanceLogDocument>;

export const loadFxaInstanceLogClass = () => fxaInstanceLogSchema;
