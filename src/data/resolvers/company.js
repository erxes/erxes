import { Customers, Tags, Companies, Users } from '../../db/models';

export default {
  customers(company) {
    return Customers.find({ companyIds: { $in: [company._id] } });
  },

  getTags(company) {
    return Tags.find({ _id: { $in: company.tagIds || [] } });
  },
  owner(company) {
    return Users.find({ _id: company.ownerId });
  },
  parentCompany(company) {
    return Companies.find({ _id: company.parentCompanyId });
  },
};
