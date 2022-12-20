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
  },
  forumCpCompleteSubscriptionOrder(
    _,
    { subscriptionOrderId, invoiceId },
    { models: { SubscriptionOrder } }
  ) {
    return SubscriptionOrder.cpCompleteSubscriptionOrder(
      subscriptionOrderId,
      invoiceId
    );
  },
  forumCpFailSubscriptionOrder(
    _,
    { subscriptionOrderId },
    { models: { SubscriptionOrder }, cpUser }
  ) {
    return SubscriptionOrder.cpFailSubscriptionOrder(
      subscriptionOrderId,
      cpUser
    );
  }
};

export default subscriptionOrderMutations;
