import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const subscriptionOrderMutations: IObjectTypeResolver<any, IContext> = {
  async forumCpCreateSubscriptionOrder(
    _,
    { subscriptionProductId },
    { models: { SubscriptionOrder }, cpUser }
  ) {
    return SubscriptionOrder.cpCreateSubscriptionOrder(
      subscriptionProductId,
      cpUser
    );
  }
};

export default subscriptionOrderMutations;
