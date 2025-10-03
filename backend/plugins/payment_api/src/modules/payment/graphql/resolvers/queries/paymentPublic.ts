import { IContext } from "~/connectionResolvers";

const queries = {
  async paymentsPublic(_root, args, { models }: IContext) {
    const { kind, _ids, currency } = args;
    const query: any = {};
    if (_ids) {
      query._id = { $in: _ids };
    }

    if (kind) {
      query.kind = kind;
    }

    if (currency) {
      query.acceptedCurrencies = currency;
    }

    return models.PaymentMethods.find(query);
  },

  async paymentsGetStripeKey(_root, args, { models }: IContext) {
    const {_id} = args

    return models.PaymentMethods.getStripeKey(_id)
  },
};

export default queries;
