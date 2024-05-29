import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const adminMutations: IObjectTypeResolver<any, IContext> = {
  async forumManuallyExtendSubscription(
    _,
    { unit, multiplier, price, userType, cpUserId },
    { models: { SubscriptionOrder } }
  ) {
    return SubscriptionOrder.manuallyExtendSubscription(
      unit,
      multiplier,
      price,
      userType,
      cpUserId
    );
  }
};

moduleRequireLogin(adminMutations);

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

export default {
  ...subscriptionOrderMutations,
  ...adminMutations
};
