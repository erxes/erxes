import { connect } from '../db/connection';
import {
  ConversationMessages,
  Conversations,
  Integrations
} from '../db/models';

/**
 * Add scopeBranIds field on deal, task, ticket, growthHack
 */

module.exports.up = async () => {
  await connect();

  const integrationIds = await Integrations.find({ kind: 'callpro' }).distinct(
    '_id'
  );
  const converstationIds = await Conversations.find({
    integrationId: { $in: integrationIds }
  }).distinct('_id');

  await ConversationMessages.deleteMany({
    conversationId: { $in: converstationIds }
  });
};
