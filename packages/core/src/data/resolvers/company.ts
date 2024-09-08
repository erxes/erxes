import { IContext } from "../../connectionResolver";
import { ICompanyDocument } from "../../db/models/definitions/companies";
import { customFieldsDataByFieldCode } from "@erxes/api-utils/src/fieldUtils";

export default {
  async __resolveReference({ _id }, { models: { Companies } }: IContext) {
    return Companies.findOne({ _id });
  },

  async customers(
    company: ICompanyDocument,
    _,
    { models: { Customers, Conformities }, subdomain }: IContext
  ) {
    const customerIds = await Conformities.savedConformity({
      mainType: "company",
      mainTypeId: company._id,
      relTypes: ["customer"]
    });

    return Customers.find({ _id: { $in: customerIds || [] } });
  },

  async getTags(company: ICompanyDocument, _, { dataLoaders }: IContext) {
    const tags = await dataLoaders.tag.loadMany(company.tagIds || []);

    return tags.filter(tag => tag);
  },

  async owner(company: ICompanyDocument, _, { models: { Users } }: IContext) {
    if (!company.ownerId) {
      return;
    }

    return Users.findOne({ _id: company.ownerId }) || {};
  },

  async parentCompany(
    { parentCompanyId }: ICompanyDocument,
    _,
    { models: { Companies } }: IContext
  ) {
    return Companies.findOne({ _id: parentCompanyId });
  },

  async customFieldsDataByFieldCode(
    company: ICompanyDocument,
    _,
    { subdomain }: IContext
  ) {
    return customFieldsDataByFieldCode(company, subdomain);
  }
};
