import { Model } from 'mongoose';
import { IRCFADocument, rcfaSchema } from './definitions/rcfa';
import { IModels } from '../connectionResolver';

export interface IRCFAModel extends Model<IRCFADocument> {
  addRCFA(doc: any): Promise<IRCFADocument>;
}

export const loadRCFAClass = (models: IModels, subdomain: string) => {
  class RCFA {
    addRCFA(doc: any) {
      return '';
    }
  }

  rcfaSchema.loadClass(RCFA);

  return rcfaSchema;
};
