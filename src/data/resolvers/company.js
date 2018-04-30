import { Customers, Tags, Companies, Users, Deals } from '../../db/models';

export default {
  customers(company) {
    return Customers.find({ companyIds: { $in: [company._id] } });
  },

  getTags(company) {
    return Tags.find({ _id: { $in: company.tagIds || [] } });
  },

  owner(company) {
    return Users.findOne({ _id: company.ownerId });
  },

  parentCompany(company) {
    return Companies.findOne({ _id: company.parentCompanyId });
  },

  deals(company) {
    return Deals.find({ companyIds: { $in: [company._id] || [] } });
  },
};
