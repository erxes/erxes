import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

/*
    forumCreateSubscriptionProduct(
        name: String
        description: String
        unit: ForumTimeDurationUnit!
        multiplier: Float!
        price: Float!
        listOrder: Float
    ): ForumSubscriptionProduct

    forumPatchSubscriptionProduct(
        _id: ID!
        name: String
        description: String
        unit: ForumTimeDurationUnit
        multiplier: Float
        price: Float
        listOrder: Float
    ): ForumSubscriptionProduct

    forumDeleteSubscriptionProduct(_id: ID!): ForumSubscriptionProduct
    */

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

export default subscriptionProductMutations;
