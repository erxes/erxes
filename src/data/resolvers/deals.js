import { Products, Companies, Customers } from '../../db/models';

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
    let amount = 0;

    data.forEach(product => {
      amount += product.amount || 0;
    });

    return amount;
  },
};
