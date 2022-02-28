import { ICompanyDocument } from '../../models/definitions/companies';
import { IContext } from '@erxes/api-utils/src';
import Companies from '../../models/Companies';
import { sendConformityMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }) {
    return Companies.findOne({ _id });
  },

  async customers(
    company: ICompanyDocument,
    _,
    { dataLoaders: { customer } }: IContext
  ) {
    const customerIds = await sendConformityMessage('savedConformity', {
      mainType: 'company',
      mainTypeId: company._id,
      relTypes: ['customer']
    });

    const customers = await customer.loadMany(customerIds || []);
    return customers.filter(c => c);
  },

  async getTags(
    company: ICompanyDocument
  ) {
    return (company.tagIds || []).map(_id => ({ __typename: "Tag", _id }));
  },

  owner(company: ICompanyDocument) {
    if(!company.ownerId) {
      return
    }

    return { __typename: "User", _id: company.ownerId };
  },

  parentCompany(
    { parentCompanyId }: ICompanyDocument,
    _,
    { dataLoaders: { company } }: IContext
  ) {
    return (parentCompanyId && company.load(parentCompanyId)) || null;
  }
};
