// import { Conformities } from '../../apiCollections';
import { ICompanyDocument } from '../../models/definitions/companies';
import { IContext } from '@erxes/api-utils/src';
import { savedConformity } from '../../messageBroker';

export default {
  async customers(
    company: ICompanyDocument,
    _,
    { dataLoaders: { customer } }: IContext
  ) {
    // replaced by messageBroker / Conformities.savedConformity => savedConformity /
    const customerIds = await savedConformity({
      mainType: 'company',
      mainTypeId: company._id,
      relTypes: ['customer']
    });
    const customers = await customer.loadMany(customerIds || []);
    return customers.filter(c => c);
  },

  async getTags(
    company: ICompanyDocument,
    _,
    { dataLoaders: { tag } }: IContext
  ) {
    const tags = await tag.loadMany(company.tagIds || []);
    return tags.filter(t => t);
  },

  owner(company: ICompanyDocument, _, { dataLoaders: { user } }: IContext) {
    return (company.ownerId && user.load(company.ownerId)) || null;
  },

  parentCompany(
    { parentCompanyId }: ICompanyDocument,
    _,
    { dataLoaders: { company } }: IContext
  ) {
    return (parentCompanyId && company.load(parentCompanyId)) || null;
  }
};
