import { EngageMessages, Users } from '../../../db/models';
import { MESSAGE_KINDS } from '../../constants';
import { send } from './engageUtils';
import { moduleRequireLogin } from '../../permissions';
import { awsRequests } from '../../../trackers/engageTracker';

const engageMutations = {
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
  async engageMessageAdd(root, doc) {
    // Checking if configs exist
    const { AWS_CONFIG_SET = '', AWS_ENDPOINT = '' } = process.env;

    if (AWS_CONFIG_SET === '' || AWS_ENDPOINT === '') {
      throw new Error('Could not locate configs on AWS SES');
    }

    // Checking if user's email verified or not
    const { fromUserId } = doc;

    const user = await Users.findOne({ _id: fromUserId });

    const emails = await awsRequests.getVerifiedEmails();

    const { VerifiedEmailAddresses = [] } = emails;

    // If verified creates engagemessage
    if (!VerifiedEmailAddresses.includes(user.email)) {
      throw new Error('Email not verified');
    }

    const engageMessage = await EngageMessages.createEngageMessage(doc);

    // if manual and live then send immediately
    if (doc.kind === MESSAGE_KINDS.MANUAL && doc.isLive) {
      await send(engageMessage);
    }

    return engageMessage;
  },

  /**
   * Edit message
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
  engageMessageEdit(root, { _id, ...doc }) {
    return EngageMessages.updateEngageMessage(_id, doc);
  },

  /**
   * Remove message
   * @param {String} _id - Engage message id
   * @return {Promise}
   */
  engageMessageRemove(root, _id) {
    return EngageMessages.removeEngageMessage(_id);
  },

  /**
   * Engage message set live
   * @param {String} _id - Engage message id
   * @return {Promise} updated message object
   */
  engageMessageSetLive(root, _id) {
    return EngageMessages.engageMessageSetLive(_id);
  },

  /**
   * Engage message set pause
   * @param {String} _id - Engage message id
   * @return {Promise} updated message object
   */
  engageMessageSetPause(root, _id) {
    return EngageMessages.engageMessageSetPause(_id);
  },

  /**
   * Engage message set live manual
   * @param {String} _id - Engage message id
   * @return {Promise} updated message object
   */
  async engageMessageSetLiveManual(root, _id) {
    const engageMessage = await EngageMessages.engageMessageSetLive(_id);

    await send(engageMessage);

    return engageMessage;
  },
};

moduleRequireLogin(engageMutations);

export default engageMutations;
