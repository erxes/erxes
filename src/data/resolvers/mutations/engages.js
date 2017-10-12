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
  messagesAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return EngageMessages.createMessage(doc);
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
  async messageEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    await EngageMessages.updateMessage(_id, doc);

    return EngageMessages.findOne({ _id });
  },

  /**
   * Remove message
   * @param {String} id
   * @return {Promise} null
   */
  async messagesRemove(root, _id, { user }) {
    if (!user) throw new Error('Login required');

    const engageObj = await EngageMessages.findOne({ _id });

    if (!engageObj) throw new Error(`Message not found with id ${_id}`);

    return engageObj.remove();
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  async messagesSetLive(root, _id, { user }) {
    if (!user) throw new Error('Login required');

    await EngageMessages.updateMessage(_id, { isLive: true, isDraft: false });

    return EngageMessages.findOne({ _id });
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  async messagesSetPause(root, _id, { user }) {
    if (!user) throw new Error('Login required');

    await EngageMessages.updateMessage(_id, { isLive: false });

    return EngageMessages.findOne({ _id });
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  async messagesSetLiveManual(root, _id, { user }) {
    if (!user) throw new Error('Login required');

    await EngageMessages.updateMessage(_id, { isLive: true, isDraft: false });

    return EngageMessages.findOne({ _id });
  },
};
