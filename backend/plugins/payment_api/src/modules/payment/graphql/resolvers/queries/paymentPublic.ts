import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

const queries: Record<string, Resolver> = {
  async paymentsPublic(_root, args, { models }: IContext) {

    const { kind, _ids, ids } = args;

    const finalIds = _ids || ids;

    if (!finalIds || finalIds.length === 0) {
      return [];
    }

    const query: any = {
      _id: { $in: finalIds },
    };

    if (kind) {
      query.kind = kind;
    }

    const result = await models.PaymentMethods.find(query);


    return result;
  },

  async cpPaymentsPublic(_root, args, { models }: IContext) {
    const { kind, _ids } = args;

    if (!_ids || _ids.length === 0) {
      return [];
    }

    const query: any = {
      _id: { $in: _ids },
    };

    if (kind) {
      query.kind = kind;
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
