import { Products, Companies, Customers, Users } from '../../db/models';

export default {
  company(deal) {
    return Companies.findOne({ _id: deal.companyId });
  },

  customer(deal) {
    return Customers.findOne({ _id: deal.customerId });
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
