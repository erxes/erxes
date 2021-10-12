import { Conformities } from '../../db/models';
import { ICompanyDocument } from '../../db/models/definitions/companies';
import { IContext } from '../types';

export default {
  async customers(
    company: ICompanyDocument,
    _,
    { dataLoaders: { customer } }: IContext
  ) {
    const customerIds = await Conformities.savedConformity({
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
