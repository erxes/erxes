import * as _ from 'underscore';
import { Deals } from '../../../db/models';
import { IItemDragCommonFields } from '../../../db/models/definitions/boards';
import { IDeal } from '../../../db/models/definitions/deals';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { checkUserIds } from '../../utils';
import { itemsAdd, itemsArchive, itemsChange, itemsCopy, itemsEdit, itemsRemove } from './boardUtils';

interface IDealsEdit extends IDeal {
  _id: string;
}

const dealMutations = {
  /**
   * Creates a new deal
   */
  async dealsAdd(_root, doc: IDeal & { proccessId: string; aboveItemId: string }, { user, docModifier }: IContext) {
    return itemsAdd(doc, 'deal', user, docModifier, Deals.createDeal);
  },

  /**
   * Edits a deal
   */
  async dealsEdit(_root, { _id, proccessId, ...doc }: IDealsEdit & { proccessId: string }, { user }: IContext) {
    const oldDeal = await Deals.getDeal(_id);

    if (doc.assignedUserIds) {
      const { removedUserIds } = checkUserIds(oldDeal.assignedUserIds, doc.assignedUserIds);
      const oldAssignedUserPdata = (oldDeal.productsData || [])
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || '');
      const cantRemoveUserIds = removedUserIds.filter(userId => oldAssignedUserPdata.includes(userId));

      if (cantRemoveUserIds.length > 0) {
        throw new Error('Cannot remove the team member, it is assigned in the product / service section');
      }
    }

    if (doc.productsData) {
      const assignedUsersPdata = doc.productsData
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || '');

      const oldAssignedUserPdata = (oldDeal.productsData || [])
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || '');

      const { addedUserIds, removedUserIds } = checkUserIds(oldAssignedUserPdata, assignedUsersPdata);

      if (addedUserIds.length > 0 || removedUserIds.length > 0) {
        let assignedUserIds = doc.assignedUserIds || oldDeal.assignedUserIds || [];
        assignedUserIds = [...new Set(assignedUserIds.concat(addedUserIds))];
        assignedUserIds = assignedUserIds.filter(userId => !removedUserIds.includes(userId));
        doc.assignedUserIds = assignedUserIds;
      }
    }

    return itemsEdit(_id, 'deal', oldDeal, doc, proccessId, user, Deals.updateDeal);
  },

  /**
   * Change deal
   */
  async dealsChange(_root, doc: IItemDragCommonFields, { user }: IContext) {
    return itemsChange(doc, 'deal', user, Deals.updateDeal);
  },

  /**
   * Remove deal
   */
  async dealsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    return itemsRemove(_id, 'deal', user);
  },

  /**
   * Watch deal
   */
  async dealsWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: IContext) {
    return Deals.watchDeal(_id, isAdd, user._id);
  },

  async dealsCopy(_root, { _id, proccessId }: { _id: string; proccessId: string }, { user }: IContext) {
    return itemsCopy(_id, proccessId, 'deal', user, ['productsData', 'paymentsData'], Deals.createDeal);
  },

  async dealsArchive(_root, { stageId, proccessId }: { stageId: string; proccessId: string }, { user }: IContext) {
    return itemsArchive(stageId, 'deal', proccessId, user);
  },
};

checkPermission(dealMutations, 'dealsAdd', 'dealsAdd');
checkPermission(dealMutations, 'dealsEdit', 'dealsEdit');
checkPermission(dealMutations, 'dealsRemove', 'dealsRemove');
checkPermission(dealMutations, 'dealsWatch', 'dealsWatch');
checkPermission(dealMutations, 'dealsArchive', 'dealsArchive');

export default dealMutations;
