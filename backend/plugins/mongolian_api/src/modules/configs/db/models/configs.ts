import { model } from 'mongoose';
import { configSchema } from '../definitions/configs';

export const Config = model('configs', configSchema);

