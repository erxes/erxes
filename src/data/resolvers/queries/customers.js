import { Customers, Segments } from '../../../db/models';

export default {
  customers(root, { limit }) {
    const customers = Customers.find({});

    if (limit) {
      return customers.limit(limit);
    }

    return customers;
  },

  segments() {
    return Segments.find({});
  },
};
