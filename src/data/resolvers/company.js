import { Customers, Tags } from '../../db/models';

export default {
  customers(company) {
    return Customers.find({ companyIds: { $in: [company._id] } });
  },

  getTags(company) {
    return Tags.find({ _id: { $in: company.tagIds || [] } });
  },
};
