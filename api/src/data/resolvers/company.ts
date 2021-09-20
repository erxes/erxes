import { Companies, Conformities, Customers } from '../../db/models';
import { ICompanyDocument } from '../../db/models/definitions/companies';
import { getDocument, getDocumentList } from './mutations/cacheUtils';

export default {
  async customers(company: ICompanyDocument) {
    console.log('start ........', company._id);

    const customerIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: company._id,
      relTypes: ['customer']
    });

    console.log('customerids ........', customerIds);

    const customers = await Customers.find({ _id: { $in: customerIds || [] } });

    console.log('customers ........', customers);

    return customers;
  },

  getTags(company: ICompanyDocument) {
    return getDocumentList('tags', { _id: { $in: company.tagIds || [] } });
  },

  owner(company: ICompanyDocument) {
    return getDocument('users', { _id: company.ownerId });
  },

  parentCompany(company: ICompanyDocument) {
    return Companies.findOne({ _id: company.parentCompanyId });
  }
};
