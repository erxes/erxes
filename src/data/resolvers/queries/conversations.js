import { Conversations } from '../../../db/models';
import QueryBuilder from './conversationQueryBuilder';

export default {
  async conversations(root, { params }) {
    // initiate query builder
    const qb = new QueryBuilder(params, { _id: 'uTaHtqQMptvhspvAK' });

    await qb.buildAllQueries();

    return Conversations.find(qb.mainQuery());
  },

  conversationDetail(root, { _id }) {
    return Conversations.findOne({ _id });
  },

  totalConversationsCount() {
    return Conversations.find({}).count();
  },
};
