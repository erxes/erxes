import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

const buildCurrencyFilter = (currency?: string) => {
  if (!currency) {
    return undefined;
  }

  return [
    { acceptedCurrencies: { $in: [currency] } },
    { acceptedCurrencies: { $exists: false } },
    { acceptedCurrencies: { $size: 0 } },
  ];
};

const queries: Record<string, Resolver> = {
  async paymentsPublic(_root, args, { models }: IContext) {
    const { kind, _ids, currency } = args;
    const query: any = {};

    if (_ids) {
      query._id = { $in: _ids };
    }

    if (kind) {
      query.kind = kind;
    }

    const currencyFilter = buildCurrencyFilter(currency);
    if (currencyFilter) {
      query.$or = currencyFilter;
    }

    return models.PaymentMethods.find(query);
  },

  async cpPaymentsPublic(_root, args, { models }: IContext) {
    const { kind, _ids, currency } = args;
    const query: any = {};

    if (_ids) {
      query._id = { $in: _ids };
    }

    if (kind) {
      query.kind = kind;
    }

    const currencyFilter = buildCurrencyFilter(currency);
    if (currencyFilter) {
      query.$or = currencyFilter;
    }

    return models.PaymentMethods.find(query);
  },

  async paymentsGetStripeKey(_root, args, { models }: IContext) {
    const { _id } = args;
    return models.PaymentMethods.getStripeKey(_id);
  },
};

export default queries;

queries.cpPaymentsPublic.wrapperConfig = {
  forClientPortal: true,
};