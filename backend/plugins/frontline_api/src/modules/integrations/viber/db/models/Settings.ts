import type { Model } from 'mongoose';
import type { IViberSettingsDocument } from '../../@types/settings';
import { viberSettingsSchema } from '../definitions/settings';

export type IViberSettingsModel = Model<IViberSettingsDocument>;

export const loadViberSettingsClass = () => viberSettingsSchema;
