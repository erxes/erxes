import { connect, disconnect } from '../db/connection';
import { ConversationMessages } from '../db/models';

export const customCommand = async () => {
  connect();

  await ConversationMessages.updateMany({ 'facebookData.isPost': true }, { 'facebookData.commentCount': 100 });

  await ConversationMessages.updateMany(
    { $and: [{ 'facebookData.commentId': { $exists: true } }, { 'facebookData.parentId': { $exists: false } }] },
    {
      'facebookData.commentCount': 100,
    },
  );

  disconnect();
};

customCommand();
