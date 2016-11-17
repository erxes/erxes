/* eslint-disable no-underscore-dangle */

import { Messages } from './messages.js';
import { Conversations } from './conversations.js';

const messageCountDenormalizer = {
  _updateConversation(conversationId) {
    // Recalculate the correct message count direct from MongoDB
    const messageCount = Messages.find({
      conversationId,
    }).count();

    Conversations.update(conversationId, { $set: { messageCount } });
  },

  afterInsertMessage(message) {
    this._updateConversation(message.conversationId);
  },

  // Here we need to take the list of messages being removed,
  // selected *before* the update because otherwise we can't figure out
  // the relevant message id(s) (if the message has been deleted)
  afterRemoveMessages(messages) {
    messages.forEach(message => this._updateConversation(message.conversationId));
  },
};

export default messageCountDenormalizer;
