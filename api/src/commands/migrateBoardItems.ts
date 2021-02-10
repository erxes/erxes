import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Deals, Tasks, Tickets } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  await Deals.find()
    .cursor()
    .eachAsync((e: any) => {
      if (!e.sourceConversationId) {
        return;
      }

      if (e.sourceConversationIds && e.sourceConversationIds.length > 0) {
        return;
      }

      e.sourceConversationIds = [e.sourceConversationId];
      e.save();
    });

  await Tasks.find()
    .cursor()
    .eachAsync((e: any) => {
      if (!e.sourceConversationId) {
        return;
      }

      if (e.sourceConversationIds && e.sourceConversationIds.length > 0) {
        return;
      }

      e.sourceConversationIds = [e.sourceConversationId];
      e.save();
    });

  await Tickets.find()
    .cursor()
    .eachAsync((e: any) => {
      if (!e.sourceConversationId) {
        return;
      }

      if (e.sourceConversationIds && e.sourceConversationIds.length > 0) {
        return;
      }

      e.sourceConversationIds = [e.sourceConversationId];
      e.save();
    });
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
