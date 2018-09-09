import { EngageMessages, Users } from '../../../db/models';
import { IEngageMessage } from '../../../db/models/definitions/engages';
import { createSchedule, updateOrRemoveSchedule } from '../../../trackers/engageScheduleTracker';
import { awsRequests } from '../../../trackers/engageTracker';
import { MESSAGE_KINDS, METHODS } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { send } from './engageUtils';

interface IEngageMessageEdit extends IEngageMessage {
  _id: string;
}

const engageMutations = {
  /**
   * Create new message
   */
  async engageMessageAdd(_root, doc: IEngageMessage) {
    const { method, fromUserId } = doc;

    if (method === METHODS.EMAIL) {
      // Checking if configs exist
      const { AWS_SES_CONFIG_SET = '', AWS_ENDPOINT = '' } = process.env;

      if (AWS_SES_CONFIG_SET === '' || AWS_ENDPOINT === '') {
        throw new Error('Could not locate configs on AWS SES');
      }

      const user = await Users.findOne({ _id: fromUserId });

      const { VerifiedEmailAddresses = [] } = await awsRequests.getVerifiedEmails();

      // If verified creates engagemessage
      if (user && !VerifiedEmailAddresses.includes(user.email)) {
        throw new Error('Email not verified');
      }
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
   */
  async engageMessageEdit(_root, { _id, ...doc }: IEngageMessageEdit) {
    await EngageMessages.updateEngageMessage(_id, doc);

    updateOrRemoveSchedule({ _id }, true);

    return EngageMessages.findOne({ _id });
  },

  /**
   * Remove message
   */
  engageMessageRemove(_root, { _id }: { _id: string }) {
    updateOrRemoveSchedule({ _id });
    return EngageMessages.removeEngageMessage(_id);
  },

  /**
   * Engage message set live
   */
  async engageMessageSetLive(_root, { _id } : { _id: string }) {
    const engageMessage = await EngageMessages.engageMessageSetLive(_id);

    const { kind } = engageMessage;

    if (kind === MESSAGE_KINDS.AUTO || kind === MESSAGE_KINDS.VISITOR_AUTO) {
      createSchedule(engageMessage);
    }

    return engageMessage;
  },

  /**
   * Engage message set pause
   */
  engageMessageSetPause(_root, { _id } : { _id: string }) {
    return EngageMessages.engageMessageSetPause(_id);
  },

  /**
   * Engage message set live manual
   */
  async engageMessageSetLiveManual(_root, { _id }: { _id: string }) {
    const engageMessage = await EngageMessages.engageMessageSetLive(_id);

    await send(engageMessage);

    return engageMessage;
  },
};

moduleRequireLogin(engageMutations);

export default engageMutations;
