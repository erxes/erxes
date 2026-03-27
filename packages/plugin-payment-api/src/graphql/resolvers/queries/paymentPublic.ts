import { IContext } from "../../../connectionResolver";
import axios from "axios";
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

  async paymentsGetStripeKey(_root, args, { models }: IContext) {
    const { _id } = args;

    return models.PaymentMethods.getStripeKey(_id);
  },
  async checkTokiUserLegalAge(_root, { token }, {}: IContext) {
    const res = await axios.get(
      "https://staging-api.toki.mn/third-party-service/v1/shoppy/user",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "api-key": process.env.TOKI_API_KEY,
          accept: "application/json",
        },
      },
    );

    const age = res.data?.data?.age ?? res.data?.age;

    return age >= 21;
  },
};

export default queries;
