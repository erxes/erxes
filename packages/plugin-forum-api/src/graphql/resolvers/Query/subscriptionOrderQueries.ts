import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

//forumCpMySubscriptionOrders: [ForumSubscriptionOrder!]

const subscriptionOrderQueries: IObjectTypeResolver<any, IContext> = {
  async forumCpMySubscriptionOrders(
    _,
    __,
    { models: { SubscriptionOrder }, cpUser }
  ) {
    return SubscriptionOrder.cpMyOrders(cpUser);
  }
};

export default subscriptionOrderQueries;
