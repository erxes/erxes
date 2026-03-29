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

  async paymentsGetStripeKey(_root, args, { models }: IContext) {
    const { _id } = args;

    return models.PaymentMethods.getStripeKey(_id);
  },
  async checkTokiUserLegalAge(_root, { token }, {}: IContext) {
    const apiKey = process.env.TOKI_API_KEY;
    const apiUrl = process.env.TOKI_API_URL;

    if (!apiKey) {
      throw new Error("Toki api key is not set");
    }

    if (!apiUrl) {
      throw new Error("Toki API URL is not set");
    }

    const response = await fetch(
      `https://${apiUrl}/third-party-service/v1/shoppy/user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "api-key": apiKey,
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Toki API error: ${text}`);
    }

    const data = await response.json();

    const age = data?.data?.age ?? data?.age;

    return age >= 21;
  },
};

export default queries;
