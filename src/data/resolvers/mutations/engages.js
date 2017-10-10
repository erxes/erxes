import { EngageMessages } from '../../../db/models';

export default {
  /**
   * Create new message
   * @return {Promise} message object
   */
  async messagesAdd(root, doc) {
    return await EngageMessages.createMessage(doc);
  },

  async messageEdit(root, { _id, ...doc }) {
    await EngageMessages.updateMessage(_id, doc);

    return await EngageMessages.findOne({ _id });
  },

  async messagesRemove(root, _id) {
    await EngageMessages.removeMessage(_id);

    return true;
  },

  async messagesSetLive(root, _id) {
    await EngageMessages.updateMessage(_id, { isLive: true, isDraft: false });

    return await EngageMessages.findOne({ _id });
  },

  async messagesSetPause(root, _id) {
    await EngageMessages.updateMessage(_id, { isLive: false });

    return await EngageMessages.findOne({ _id });
  },

  async messagesSetLiveManual(root, _id) {
    await EngageMessages.updateMessage(_id, { isLive: true, isDraft: false });

    return await EngageMessages.findOne({ _id });
  },
};
