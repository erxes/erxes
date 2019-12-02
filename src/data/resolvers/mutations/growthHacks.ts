import { GrowthHacks } from '../../../db/models';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IGrowthHack } from '../../../db/models/definitions/growthHacks';
import { IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission } from '../../permissions/wrappers';
import { checkUserIds, putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';
import { IBoardNotificationParams, itemsChange, sendNotifications } from '../boardUtils';

interface IGrowthHacksEdit extends IGrowthHack {
  _id: string;
}

const growthHackMutations = {
  /**
   * Create new growth hack
   */
  async growthHacksAdd(_root, doc: IGrowthHack, { user }: { user: IUserDocument }) {
    doc.initialStageId = doc.stageId;
    doc.watchedUserIds = [user._id];

    const growthHack = await GrowthHacks.createGrowthHack({
      ...doc,
      modifiedBy: user._id,
      userId: user._id,
    });

    await sendNotifications({
      item: growthHack,
      user,
      type: NOTIFICATION_TYPES.GROWTHHACK_ADD,
      action: 'invited you to the growthHack',
      content: `'${growthHack.name}'.`,
      contentType: 'growthHack',
    });

    await putCreateLog(
      {
        type: 'growthHack',
        newData: JSON.stringify(doc),
        object: growthHack,
        description: `${growthHack.name} has been created`,
      },
      user,
    );

    return growthHack;
  },

  /**
   * Edit a growth hack
   */
  async growthHacksEdit(_root, { _id, ...doc }: IGrowthHacksEdit, { user }) {
    const oldGrowthHack = await GrowthHacks.getGrowthHack(_id);

    const updatedGrowthHack = await GrowthHacks.updateGrowthHack(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    });

    const notificationDoc: IBoardNotificationParams = {
      item: updatedGrowthHack,
      user,
      type: NOTIFICATION_TYPES.GROWTHHACK_EDIT,
      action: `has updated a growth hack`,
      content: `${updatedGrowthHack.name}`,
      contentType: 'growthHack',
    };

    if (doc.assignedUserIds && doc.assignedUserIds.length > 0 && oldGrowthHack.assignedUserIds) {
      const { addedUserIds, removedUserIds } = checkUserIds(
        oldGrowthHack.assignedUserIds || [],
        doc.assignedUserIds || [],
      );

      notificationDoc.invitedUsers = addedUserIds;
      notificationDoc.removedUsers = removedUserIds;
    }

    await sendNotifications(notificationDoc);

    await putUpdateLog(
      {
        type: 'growthHack',
        object: updatedGrowthHack,
        newData: JSON.stringify(doc),
        description: `${updatedGrowthHack.name} has been edited`,
      },
      user,
    );

    return updatedGrowthHack;
  },

  /**
   * Change a growth hack
   */
  async growthHacksChange(
    _root,
    { _id, destinationStageId }: { _id: string; destinationStageId: string },
    { user }: { user: IUserDocument },
  ) {
    const growthHack = await GrowthHacks.getGrowthHack(_id);

    await GrowthHacks.updateGrowthHack(_id, {
      modifiedAt: new Date(),
      modifiedBy: user._id,
      stageId: destinationStageId,
    });

    const { content, action } = await itemsChange(growthHack, 'growthHack', destinationStageId);

    await sendNotifications({
      item: growthHack,
      user,
      type: NOTIFICATION_TYPES.GROWTHHACK_CHANGE,
      content,
      action,
      contentType: 'growthHack',
    });

    return growthHack;
  },

  /**
   * Update growth hack orders (not sendNotifaction, ordered card to change)
   */
  growthHacksUpdateOrder(_root, { stageId, orders }: { stageId: string; orders: IOrderInput[] }) {
    return GrowthHacks.updateOrder(stageId, orders);
  },

  /**
   * Remove a growth hack
   */
  async growthHacksRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const growthHack = await GrowthHacks.getGrowthHack(_id);

    await sendNotifications({
      item: growthHack,
      user,
      type: NOTIFICATION_TYPES.GROWTHHACK_DELETE,
      action: `deleted growth hack:`,
      content: `'${growthHack.name}'`,
      contentType: 'growthHack',
    });

    const removed = growthHack.remove();

    await putDeleteLog(
      {
        type: 'growthHack',
        object: growthHack,
        description: `${growthHack.name} has been removed`,
      },
      user,
    );

    return removed;
  },

  /**
   * Watch a growth hack
   */
  growthHacksWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: { user: IUserDocument }) {
    return GrowthHacks.watchGrowthHack(_id, isAdd, user._id);
  },

  /**
   * Vote a growth hack
   */
  growthHacksVote(_root, { _id, isVote }: { _id: string; isVote: boolean }, { user }: { user: IUserDocument }) {
    return GrowthHacks.voteGrowthHack(_id, isVote, user._id);
  },
};

checkPermission(growthHackMutations, 'growthHacksAdd', 'growthHacksAdd');
checkPermission(growthHackMutations, 'growthHacksEdit', 'growthHacksEdit');
checkPermission(growthHackMutations, 'growthHacksUpdateOrder', 'growthHacksUpdateOrder');
checkPermission(growthHackMutations, 'growthHacksRemove', 'growthHacksRemove');
checkPermission(growthHackMutations, 'growthHacksWatch', 'growthHacksWatch');

export default growthHackMutations;
