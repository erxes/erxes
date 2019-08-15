import { EngageMessages } from '../../../db/models';
import { IEngageMessage } from '../../../db/models/definitions/engages';
import { debugExternalApi } from '../../../debuggers';
import { MESSAGE_KINDS } from '../../constants';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { fetchCronsApi, putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';
import { send } from './engageUtils';

interface IEngageMessageEdit extends IEngageMessage {
  _id: string;
}

const engageMutations = {
  /**
   * Create new message
   */
  async engageMessageAdd(_root, doc: IEngageMessage, { user, docModifier }: IContext) {
    const engageMessage = await EngageMessages.createEngageMessage(docModifier(doc));

    await send(engageMessage);

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
  async engageMessageEdit(_root, { _id, ...doc }: IEngageMessageEdit, { user, docModifier }: IContext) {
    const engageMessage = await EngageMessages.findOne({ _id });
    const updated = await EngageMessages.updateEngageMessage(_id, docModifier(doc));

    try {
      await fetchCronsApi({ path: '/update-or-remove-schedule', method: 'POST', body: { _id, update: 'true' } });
    } catch (e) {
      debugExternalApi(`Error occurred : ${e.body || e.message}`);
    }

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
  async engageMessageRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const engageMessage = await EngageMessages.findOne({ _id });

    try {
      await fetchCronsApi({ path: '/update-or-remove-schedule', method: 'POST', body: { _id } });
    } catch (e) {
      debugExternalApi(`Error occurred : ${e.body || e.message}`);
    }

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
      try {
        await fetchCronsApi({
          path: '/create-schedule',
          method: 'POST',
          body: { message: JSON.stringify(engageMessage) },
        });
      } catch (e) {
        debugExternalApi(`Error occurred : ${e.body || e.message}`);
      }
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
