import { Customers } from '../../db/models';

export default {
  customers(company) {
    return Customers.find({ companyIds: { $in: [company._id] } });
  },
};
