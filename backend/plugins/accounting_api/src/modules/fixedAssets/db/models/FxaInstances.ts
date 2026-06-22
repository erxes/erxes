import { Model } from 'mongoose';
import { IFxaInstanceDocument } from '../../@types/fxaInstance';
import { fxaInstanceSchema } from '../definitions/fxaInstance';

export type IFxaInstanceModel = Model<IFxaInstanceDocument>;

export const loadFxaInstanceClass = () => fxaInstanceSchema;
