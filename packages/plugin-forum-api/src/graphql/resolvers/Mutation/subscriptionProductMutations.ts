import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const subscriptionProductMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreateSubscriptionProduct(
    _,
    args,
    { models: { SubscriptionProduct } }
  ) {
    return SubscriptionProduct.createSubscriptionProduct(args);
  },
  async forumPatchSubscriptionProduct(
    _,
    args,
    { models: { SubscriptionProduct } }
  ) {
    const { _id, ...patch } = args;
    return SubscriptionProduct.patchSubscriptionProduct(_id, patch);
  },
  async forumDeleteSubscriptionProduct(
    _,
    args,
    { models: { SubscriptionProduct } }
  ) {
    return SubscriptionProduct.deleteSubscriptionProduct(args._id);
  }
};

moduleRequireLogin(subscriptionProductMutations);

export default subscriptionProductMutations;
