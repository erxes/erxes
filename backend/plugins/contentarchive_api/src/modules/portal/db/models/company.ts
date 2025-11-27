import {
  IPortalCompany,
  IPortalCompanyDocument,
} from '@/portal/@types/company';
import { portalCompanySchema } from '@/portal/db/definitions/company';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IPortalCompanyModel extends Model<IPortalCompanyDocument> {
  getCompany(_id: string): Promise<IPortalCompanyDocument>;
  createOrUpdateCompany(doc: IPortalCompany): Promise<IPortalCompanyDocument>;
  createCompany(doc: IPortalCompany): Promise<IPortalCompanyDocument>;
  updateCompany(
    _id: string,
    doc: IPortalCompany,
  ): Promise<IPortalCompanyDocument>;
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

    public static async createCompany(doc: IPortalCompanyDocument) {
      return models.Companies.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    public static async updateCompany(
      _id: string,
      doc: IPortalCompanyDocument,
    ) {
      await models.Companies.updateOne({ _id }, { $set: doc });

      return this.getCompany(_id);
    }

    public static async deleteCompany(_id: string) {
      return models.Companies.deleteOne({ _id });
    }

    public static async createOrUpdateCompany(doc: IPortalCompanyDocument) {
      const { erxesCompanyId, clientPortalId } = doc;

      const company = await models.Companies.findOne({
        erxesCompanyId,
        clientPortalId,
      });

      if (company) {
        return this.updateCompany(company._id, doc);
      }

      return this.createCompany(doc);
    }
  }

  portalCompanySchema.loadClass(Company);

  return portalCompanySchema;
};
