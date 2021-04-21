import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { ConversationMessages, Conversations } from '../db/models';

dotenv.config();

const command = async () => {
  await connect();

  const argv = process.argv;

  const convos = await Conversations.find({
    status: { $ne: 'engageVisitorAuto' },
    userId: { $exists: true },
    messageCount: 1
  });

  console.log('Found', convos.length);

  if (argv.length > 2) {
    for (const convo of convos) {
      await ConversationMessages.remove({ conversationId: convo._id });
      await Conversations.remove({ _id: convo._id });
    }
  }
};

command().then(() => {
  process.exit();
});
