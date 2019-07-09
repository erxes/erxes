import { EngageMessages, Users } from '../../../db/models';
import { METHODS } from '../../../db/models/definitions/constants';
import { IEngageMessage } from '../../../db/models/definitions/engages';
import { IUserDocument } from '../../../db/models/definitions/users';
import { awsRequests } from '../../../trackers/engageTracker';
import { MESSAGE_KINDS } from '../../constants';
import { checkPermission } from '../../permissions/wrappers';
import { fetchCronsApi, getEnv, putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';
import { send } from './engageUtils';

interface IEngageMessageEdit extends IEngageMessage {
  _id: string;
}

const engageMutations = {
  /**
   * Create new message
   */
  async engageMessageAdd(_root, doc: IEngageMessage, { user }: { user: IUserDocument }) {
    const { method, fromUserId } = doc;

    if (method === METHODS.EMAIL) {
      // Checking if configs exist
      getEnv({ name: 'AWS_SES_CONFIG_SET' });
      getEnv({ name: 'AWS_ENDPOINT' });

      const fromUser = await Users.findOne({ _id: fromUserId });

      const { VerifiedEmailAddresses = [] } = await awsRequests.getVerifiedEmails();

      // If verified creates engagemessage
      if (fromUser && !VerifiedEmailAddresses.includes(fromUser.email)) {
        throw new Error('Email not verified');
      }
    }

    const engageMessage = await EngageMessages.createEngageMessage(doc);

    // if manual and live then send immediately
    if (doc.kind === MESSAGE_KINDS.MANUAL && doc.isLive) {
      await send(engageMessage);
    }

    if (engageMessage) {
      await putCreateLog(
        {
          type: 'engage',
          newData: JSON.stringify(doc),
          object: engageMessage,
          description: `${engageMessage.title} has been created`,
        },
        user,
      );
    }

    return engageMessage;
  },

  /**
   * Edit message
   */
  async engageMessageEdit(_root, { _id, ...doc }: IEngageMessageEdit, { user }: { user: IUserDocument }) {
    const engageMessage = await EngageMessages.findOne({ _id });
    const updated = await EngageMessages.updateEngageMessage(_id, doc);

    await fetchCronsApi({ path: '/update-or-remove-schedule', method: 'POST', body: { _id, update: 'true' } });

    if (engageMessage) {
      await putUpdateLog(
        {
          type: 'engage',
          object: engageMessage,
          newData: JSON.stringify(updated),
          description: `${engageMessage.title} has been edited`,
        },
        user,
      );
    }

    return EngageMessages.findOne({ _id });
  },

  /**
   * Remove message
   */
  async engageMessageRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const engageMessage = await EngageMessages.findOne({ _id });

    await fetchCronsApi({ path: '/update-or-remove-schedule', method: 'POST', body: { _id } });

    const removed = await EngageMessages.removeEngageMessage(_id);

    if (engageMessage) {
      await putDeleteLog(
        {
          type: 'engage',
          object: engageMessage,
          description: `${engageMessage.title} has been removed`,
        },
        user,
      );
    }

    return removed;
  },

  /**
   * Engage message set live
   */
  async engageMessageSetLive(_root, { _id }: { _id: string }) {
    const engageMessage = await EngageMessages.engageMessageSetLive(_id);

    const { kind } = engageMessage;

    if (kind === MESSAGE_KINDS.AUTO || kind === MESSAGE_KINDS.VISITOR_AUTO) {
      await fetchCronsApi({
        path: '/create-schedule',
        method: 'POST',
        body: { message: JSON.stringify(engageMessage) },
      });
    }

    return engageMessage;
  },

  /**
   * Engage message set pause
   */
  engageMessageSetPause(_root, { _id }: { _id: string }) {
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

checkPermission(engageMutations, 'engageMessageAdd', 'engageMessageAdd');
checkPermission(engageMutations, 'engageMessageEdit', 'engageMessageEdit');
checkPermission(engageMutations, 'engageMessageRemove', 'engageMessageRemove');
checkPermission(engageMutations, 'engageMessageSetLive', 'engageMessageSetLive');
checkPermission(engageMutations, 'engageMessageSetPause', 'engageMessageSetPause');
checkPermission(engageMutations, 'engageMessageSetLiveManual', 'engageMessageSetLiveManual');

export default engageMutations;
