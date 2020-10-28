import { cleanHtml } from '../data/utils';
import { connect } from '../db/connection';
import { Conversations } from '../db/models';

module.exports.up = async () => {
  await connect();

  const conversations = await Conversations.find({}, { _id: 1, content: 1 });

  for (const conversation of conversations) {
    await Conversations.updateOne(
      { _id: conversation._id },
      { $set: { content: cleanHtml(conversation.content) } }
    );
  }
};
