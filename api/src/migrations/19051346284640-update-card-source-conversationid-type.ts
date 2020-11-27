import { connect } from '../db/connection';
import { Deals, Tasks, Tickets } from '../db/models';

/**
 * Rename crad's sourceConversationId to sourceConversationIds
 *
 */
module.exports.up = async () => {
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

  return Promise.resolve('done');
};
