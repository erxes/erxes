import { GrowthHacks } from '../../../db/models';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IGrowthHack } from '../../../db/models/definitions/growthHacks';
import { IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission } from '../../permissions/wrappers';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';
import { itemsChange, sendNotifications } from '../boardUtils';
import { checkUserIds } from './notifications';

interface IGrowthHacksEdit extends IGrowthHack {
  _id: string;
}

const growthHackMutations = {
  /**
   * Create new growthHack
   */
  async growthHacksAdd(_root, doc: IGrowthHack, { user }: { user: IUserDocument }) {
    doc.initialStageId = doc.stageId;
    const growthHack = await GrowthHacks.createGrowthHack({
      ...doc,
      modifiedBy: user._id,
    });

    await sendNotifications({
      item: growthHack,
      user,
      type: NOTIFICATION_TYPES.GROWTH_HACK_ADD,
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
   * Edit growthHack
   */
  async growthHacksEdit(_root, { _id, ...doc }: IGrowthHacksEdit, { user }) {
    const oldGrowthHack = await GrowthHacks.getGrowthHack(_id);

    const updatedGrowthHack = await GrowthHacks.updateGrowthHack(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    });

    const { addedUserIds, removedUserIds } = checkUserIds(
      oldGrowthHack.assignedUserIds || [],
      doc.assignedUserIds || [],
    );

    await sendNotifications({
      item: updatedGrowthHack,
      user,
      type: NOTIFICATION_TYPES.GROWTH_HACK_EDIT,
      invitedUsers: addedUserIds,
      removedUsers: removedUserIds,
      action: `has updated growthHack`,
      content: `${updatedGrowthHack.name}`,
      contentType: 'growthHack',
    });

    if (updatedGrowthHack) {
      await putUpdateLog(
        {
          type: 'growthHack',
          object: updatedGrowthHack,
          newData: JSON.stringify(doc),
          description: `${updatedGrowthHack.name} has been edited`,
        },
        user,
      );
    }
    return updatedGrowthHack;
  },

  /**
   * Change growthHack
   */
  async growthHacksChange(
    _root,
    { _id, destinationStageId }: { _id: string; destinationStageId: string },
    { user }: { user: IUserDocument },
  ) {
    const growthHack = await GrowthHacks.findOne({ _id });

    if (!growthHack) {
      throw new Error('Growth hack not found');
    }

    await GrowthHacks.updateGrowthHack(_id, {
      modifiedAt: new Date(),
      modifiedBy: user._id,
      stageId: destinationStageId,
    });

    const { content, action } = await itemsChange(growthHack, 'growthHack', destinationStageId);

    await sendNotifications({
      item: growthHack,
      user,
      type: NOTIFICATION_TYPES.GROWTH_HACK_CHANGE,
      content,
      action,
      contentType: 'growthHack',
    });

    return growthHack;
  },

  /**
   * Update growthHack orders (not sendNotifaction, ordered card to change)
   */
  growthHacksUpdateOrder(_root, { stageId, orders }: { stageId: string; orders: IOrderInput[] }) {
    return GrowthHacks.updateOrder(stageId, orders);
  },

  /**
   * Remove growthHack
   */
  async growthHacksRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const growthHack = await GrowthHacks.findOne({ _id });

    if (!growthHack) {
      throw new Error('Growth hack not found');
    }

    await sendNotifications({
      item: growthHack,
      user,
      type: NOTIFICATION_TYPES.GROWTH_HACK_DELETE,
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
   * Watch growthHack
   */
  async growthHacksWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: { user: IUserDocument }) {
    const growthHack = await GrowthHacks.findOne({ _id });

    if (!growthHack) {
      throw new Error('Growth hack not found');
    }

    return GrowthHacks.watchGrowthHack(_id, isAdd, user._id);
  },
};

checkPermission(growthHackMutations, 'growthHacksAdd', 'growthHacksAdd');
checkPermission(growthHackMutations, 'growthHacksEdit', 'growthHacksEdit');
checkPermission(growthHackMutations, 'growthHacksUpdateOrder', 'growthHacksUpdateOrder');
checkPermission(growthHackMutations, 'growthHacksRemove', 'growthHacksRemove');
checkPermission(growthHackMutations, 'growthHacksWatch', 'growthHacksWatch');

export default growthHackMutations;
