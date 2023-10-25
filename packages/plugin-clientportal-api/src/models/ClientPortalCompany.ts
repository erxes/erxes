import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  companySchema,
  IClientCompany,
  IClientCompanyDocument
} from './definitions/clientPortalCompany';

export interface IClientCompanyModel extends Model<IClientCompanyDocument> {
  getCompany(_id: string): Promise<IClientCompanyDocument>;
  createOrUpdateCompany(doc: IClientCompany): Promise<IClientCompanyDocument>;
  createCompany(doc: IClientCompany): Promise<IClientCompanyDocument>;
  updateCompany(
    _id: string,
    doc: IClientCompany
  ): Promise<IClientCompanyDocument>;
  deleteCompany(_id: string): void;
}

export const loadCompanyClass = (models: IModels) => {
  class Company {
    /**
     * Retreives clientPortalCompany
     */
    public static async getCompany(_id: string) {
      const clientPortalCompany = await models.Companies.findOne({ _id });

      if (!clientPortalCompany) {
        throw new Error('Company not found');
      }

      return clientPortalCompany;
    }

    public static async createCompany(doc: IClientCompanyDocument) {
      return models.Companies.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateCompany(
      _id: string,
      doc: IClientCompanyDocument
    ) {
      await models.Companies.updateOne({ _id }, { $set: doc });

      return this.getCompany(_id);
    }

    public static async deleteCompany(_id: string) {
      return models.Companies.deleteOne({ _id });
    }

    public static async createOrUpdateCompany(doc: IClientCompanyDocument) {
      const { erxesCompanyId, clientPortalId } = doc;

      const company = await models.Companies.findOne({
        erxesCompanyId,
        clientPortalId
      });

      if (company) {
        return this.updateCompany(company._id, doc);
      }

      return this.createCompany(doc);
    }
  }

  companySchema.loadClass(Company);

  return companySchema;
};
