import { Model } from 'mongoose';
import { IRCFADocument, rcfaSchema } from './definitions/rcfa';
import { IModels } from '../connectionResolver';

export interface IRCFAModel extends Model<IRCFADocument> {}

export const loadRCFAClass = (models: IModels, subdomain: string) => {
  class RCFA {}

  rcfaSchema.loadClass(RCFA);

  return rcfaSchema;
};
