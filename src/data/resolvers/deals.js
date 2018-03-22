import { Products, Companies, Customers, Users } from '../../db/models';

export default {
  companies(deal) {
    return Companies.find({ _id: { $in: deal.companyIds || [] } });
  },

  customers(deal) {
    return Customers.find({ _id: { $in: deal.customerIds || [] } });
  },

  products(deal) {
    return Products.find({ _id: { $in: deal.productIds || [] } });
  },

  amount(deal) {
    const data = deal.productsData || [];
    const amountObj = {};

    data.forEach(product => {
      const type = product.currency;

      if (!amountObj[type]) amountObj[type] = 0;

      amountObj[type] += product.amount || 0;
    });

    return amountObj;
  },

  assignedUsers(deal) {
    return Users.find({ _id: { $in: deal.assignedUserIds } });
  },
};
