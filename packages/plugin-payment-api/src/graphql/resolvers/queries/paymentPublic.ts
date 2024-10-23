import { IContext } from "../../../connectionResolver";

const queries = {
  async paymentsPublic(_root, args, { models }: IContext) {
    const { kind, _ids, currency } = args;
    let query: any = {};
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
};

export default queries;
