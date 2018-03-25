import { Products, Companies, Customers, Users } from '../../db/models';

export default {
  companies(deal) {
    return Companies.find({ _id: { $in: deal.companyIds || [] } });
  },

  customers(deal) {
    return Customers.find({ _id: { $in: deal.customerIds || [] } });
  },

  async products(deal) {
    const products = [];

    for (const data of deal.productsData || []) {
      const product = await Products.findOne({ _id: data.productId });

      // Add product object to resulting list
      products.push({
        ...data.toJSON(),
        product: product.toJSON(),
      });
    }

    return products;
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
