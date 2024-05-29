import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
    IVerifiedDomainDocument,
    domainSchema,
} from './definitions/verifiedDomains';


export interface IVerifiedDomainModel extends Model<IVerifiedDomainDocument> {
  createDomain(domain: string): IVerifiedDomainDocument;
}

export const loadDomainClass = (models: IModels) => {
  class Domain {
    public static async createDomain(domain: string) {
      return models.Domains.create({ domain });
    }
  }

  domainSchema.loadClass(Domain);

  return domainSchema;
};
