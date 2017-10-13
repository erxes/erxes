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
  engageMessageAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return EngageMessages.createEngageMessage(doc);
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
  engageMessageUpdate(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    return EngageMessages.updateEngageMessage(_id, doc);
  },

  /**
   * Remove message
   * @param {String} id
   * @return {Promise} null
   */
  engageMessageRemove(root, _id, { user }) {
    if (!user) throw new Error('Login required');

    return EngageMessages.removeEngageMessage(_id);
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  engageMessageSetLive(root, _id, { user }) {
    if (!user) throw new Error('Login required');

    return EngageMessages.engageMessageSetLive(_id);
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  engageMessageSetPause(root, _id, { user }) {
    if (!user) throw new Error('Login required');

    return EngageMessages.engageMessageSetPause(_id);
  },

  /**
   * Update message
   * @param {String} id
   * @return {Promise} message object
   */
  engageMessageSetLiveManual(root, _id, { user }) {
    if (!user) throw new Error('Login required');

    return EngageMessages.engageMessageSetLive(_id);
  },
};
