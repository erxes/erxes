import { Deals } from '../../../db/models';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { IDeal } from '../../../db/models/definitions/deals';
import { IUserDocument } from '../../../db/models/definitions/users';
import { NOTIFICATION_TYPES } from '../../constants';
import { checkPermission } from '../../permissions';
import { itemsChange, manageNotifications, sendNotifications } from '../boardUtils';

interface IDealsEdit extends IDeal {
  _id: string;
}

const dealMutations = {
  /**
   * Create new deal
   */
  async dealsAdd(_root, doc: IDeal, { user }: { user: IUserDocument }) {
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
    { _id, destinationStageId }: { _id: string; destinationStageId?: string },
    { user }: { user: IUserDocument },
  ) {
    const deal = await Deals.updateDeal(_id, {
      modifiedAt: new Date(),
      modifiedBy: user._id,
    });

    const content = await itemsChange(Deals, deal, 'deal', destinationStageId);

    await sendNotifications(
      deal.stageId || '',
      user,
      NOTIFICATION_TYPES.DEAL_CHANGE,
      deal.assignedUserIds || [],
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
      deal.assignedUserIds || [],
      `'{userName}' deleted deal: '${deal.name}'`,
      'deal',
    );

    return Deals.removeDeal(_id);
  },
};

checkPermission(dealMutations, 'dealsAdd', 'dealsAdd');
checkPermission(dealMutations, 'dealsEdit', 'dealsEdit');
checkPermission(dealMutations, 'dealsUpdateOrder', 'dealsUpdateOrder');
checkPermission(dealMutations, 'dealsRemove', 'dealsRemove');

export default dealMutations;
