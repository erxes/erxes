import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const subscriptionProductQueries: IObjectTypeResolver<any, IContext> = {
  forumSubscriptionProduct(_, { _id }, { models: { SubscriptionProduct } }) {
    return SubscriptionProduct.findByIdOrThrow(_id);
  },
  forumSubscriptionProducts(
    _,
    { sort = {} },
    { models: { SubscriptionProduct } }
  ) {
    return SubscriptionProduct.find()
      .sort(sort)
      .lean();
  }
};

export default subscriptionProductQueries;
