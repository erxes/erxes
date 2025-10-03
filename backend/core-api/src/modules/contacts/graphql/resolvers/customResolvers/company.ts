import { ICompanyDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export default {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return await models.Companies.findOne({ _id }).lean();
  },

  owner: async (company: ICompanyDocument, _, { models }: IContext) => {
    if (!company.ownerId) {
      return;
    }

    return (await models.Users.findOne({ _id: company.ownerId }).lean()) || {};
  },

  parentCompany: async (
    { parentCompanyId }: ICompanyDocument,
    _,
    { models }: IContext,
  ) => {
    return await models.Companies.findOne({ _id: parentCompanyId }).lean();
  },

  customers: async (
    company: ICompanyDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    const customerIds = await models.Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: company._id,
      relTypes: ['customer'],
    });

    return models.Customers.find({ _id: { $in: customerIds || [] } }).lean();
  },
};
