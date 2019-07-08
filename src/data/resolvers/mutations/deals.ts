import { Deals } from '../../../db/models';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IDeal } from '../../../db/models/definitions/deals';
import { IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission } from '../../permissions/wrappers';
import { itemsChange, manageNotifications, notifiedUserIds, sendNotifications } from '../boardUtils';

interface IDealsEdit extends IDeal {
  _id: string;
}

const dealMutations = {
  /**
   * Create new deal
   */
  async dealsAdd(_root, doc: IDeal, { user }: { user: IUserDocument }) {
    doc.initialStageId = doc.stageId;
    const deal = await Deals.createDeal({
      ...doc,
      modifiedBy: user._id,
    });

    await sendNotifications(
      deal.stageId || '',
      user,
      NOTIFICATION_TYPES.DEAL_ADD,
      deal.assignedUserIds || [],
      `'{userName}' invited you to the '${deal.name}'.`,
      'deal',
    );

    return deal;
  },

  /**
   * Edit deal
   */
  async dealsEdit(_root, { _id, ...doc }: IDealsEdit, { user }) {
    const deal = await Deals.updateDeal(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    });

    await manageNotifications(Deals, deal, user, 'deal');

    return deal;
  },

  /**
   * Change deal
   */
  async dealsChange(
    _root,
    { _id, destinationStageId }: { _id: string; destinationStageId: string },
    { user }: { user: IUserDocument },
  ) {
    const deal = await Deals.updateDeal(_id, {
      modifiedAt: new Date(),
      modifiedBy: user._id,
      stageId: destinationStageId,
    });

    const content = await itemsChange(Deals, deal, 'deal', destinationStageId);

    await sendNotifications(
      deal.stageId || '',
      user,
      NOTIFICATION_TYPES.DEAL_CHANGE,
      await notifiedUserIds(deal),
      content,
      'deal',
    );

    return deal;
  },

  /**
   * Update deal orders (not sendNotifaction, ordered card to change)
   */
  dealsUpdateOrder(_root, { stageId, orders }: { stageId: string; orders: IOrderInput[] }) {
    return Deals.updateOrder(stageId, orders);
  },

  /**
   * Remove deal
   */
  async dealsRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const deal = await Deals.findOne({ _id });

    if (!deal) {
      throw new Error('Deal not found');
    }

    await sendNotifications(
      deal.stageId || '',
      user,
      NOTIFICATION_TYPES.DEAL_DELETE,
      await notifiedUserIds(deal),
      `'{userName}' deleted deal: '${deal.name}'`,
      'deal',
    );

    return Deals.removeDeal(_id);
  },

  /**
   * Watch deal
   */
  async dealsWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: { user: IUserDocument }) {
    const deal = await Deals.findOne({ _id });

    if (!deal) {
      throw new Error('Deal not found');
    }

    return Deals.watchDeal(_id, isAdd, user._id);
  },
};

checkPermission(dealMutations, 'dealsAdd', 'dealsAdd');
checkPermission(dealMutations, 'dealsEdit', 'dealsEdit');
checkPermission(dealMutations, 'dealsUpdateOrder', 'dealsUpdateOrder');
checkPermission(dealMutations, 'dealsRemove', 'dealsRemove');
checkPermission(dealMutations, 'dealsWatch', 'dealsWatch');

export default dealMutations;
