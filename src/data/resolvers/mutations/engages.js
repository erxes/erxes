import { EngageMessages } from '../../../db/models';

export default {
  /**
   * Create new message
   * @param {String} doc.title
   * @param {String} doc.fromUserId
   * @param {String} doc.kind
   * @param {String} doc.method
   * @param {String} doc.email
   * @param {[String]} doc.customerIds
   * @param {String} doc.messenger
   * @param {Boolean} doc.isDraft
   * @param {Boolean} doc.isLive
   * @param {Date} doc.stopDate
   * @param {[String]} doc.tagIds
   * @return {Promise} message object
   */
  async messagesAdd(root, doc) {
    return await EngageMessages.createMessage(doc);
  },

  /**
   * Update message
   * @param {String} doc.title
   * @param {String} doc.fromUserId
   * @param {String} doc.kind
   * @param {String} doc.method
   * @param {String} doc.email
   * @param {[String]} doc.customerIds
   * @param {String} doc.messenger
   * @param {Boolean} doc.isDraft
   * @param {Boolean} doc.isLive
   * @param {Date} doc.stopDate
   * @param {[String]} doc.tagIds
   * @return {Promise} message object
   */
  async messageEdit(root, { _id, ...doc }) {
    await EngageMessages.updateMessage(_id, doc);

    return await EngageMessages.findOne({ _id });
  },

  /**
   * Remove message
   * @param {String} id
   * @return {Promise} null
   */
  async messagesRemove(root, _id) {
    await EngageMessages.removeMessage(_id);

    return true;
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  async messagesSetLive(root, _id) {
    await EngageMessages.updateMessage(_id, { isLive: true, isDraft: false });

    return await EngageMessages.findOne({ _id });
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  async messagesSetPause(root, _id) {
    await EngageMessages.updateMessage(_id, { isLive: false });

    return await EngageMessages.findOne({ _id });
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  async messagesSetLiveManual(root, _id) {
    await EngageMessages.updateMessage(_id, { isLive: true, isDraft: false });

    return await EngageMessages.findOne({ _id });
  },
};
