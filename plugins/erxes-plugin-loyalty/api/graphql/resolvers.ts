import voucher from "./resolvers/voucher";
import voucherCompaign from "./resolvers/voucherCompaign";

const resolvers = [
  ...voucherCompaign,
  ...voucher,
  {
    type: 'Loyalty',
    field: 'user',
    handler: (loyalty, { }, { models }) => {
      if (!loyalty.userId){
        return null;
      }

      return models.Users.findOne({ _id: loyalty.userId });
    }
  },
  {
    type: 'Loyalty',
    field: 'customer',
    handler: (loyalty, { }, { models }) => {
      return models.Customers.getCustomer(loyalty.customerId);
    }
  },
  {
    type: 'Loyalty',
    field: 'deal',
    handler: (loyalty, { }, { models }) => {
      if (!loyalty.dealId) {
        return null;
      }

      return models.Deals.findOne({ _id: loyalty.dealId });
    }
  }
]

export default resolvers;