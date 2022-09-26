import * as _ from 'underscore';
import { IItemDragCommonFields } from '../../../models/definitions/boards';
import { IDeal } from '../../../models/definitions/deals';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { checkUserIds } from '@erxes/api-utils/src';
import {
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove
} from './utils';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { connected } from 'process';

interface IDealsEdit extends IDeal {
  _id: string;
}

const dealMutations = {
  /**
   * Creates a new deal
   */
  async dealsAdd(
    _root,
    doc: IDeal & { proccessId: string; aboveItemId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsAdd(
      models,
      subdomain,
      doc,
      'deal',
      models.Deals.createDeal,
      user
    );
  },

  /**
   * Edits a deal
   */
  async dealsEdit(
    _root,
    { _id, proccessId, ...doc }: IDealsEdit & { proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    const oldDeal = await models.Deals.getDeal(_id);

    if (doc.assignedUserIds) {
      const { removedUserIds } = checkUserIds(
        oldDeal.assignedUserIds,
        doc.assignedUserIds
      );
      const oldAssignedUserPdata = (oldDeal.productsData || [])
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || '');
      const cantRemoveUserIds = removedUserIds.filter(userId =>
        oldAssignedUserPdata.includes(userId)
      );

      if (cantRemoveUserIds.length > 0) {
        throw new Error(
          'Cannot remove the team member, it is assigned in the product / service section'
        );
      }
    }

    if (doc.productsData) {
      const assignedUsersPdata = doc.productsData
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || '');

      const oldAssignedUserPdata = (oldDeal.productsData || [])
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || '');

      const { addedUserIds, removedUserIds } = checkUserIds(
        oldAssignedUserPdata,
        assignedUsersPdata
      );

      if (addedUserIds.length > 0 || removedUserIds.length > 0) {
        let assignedUserIds =
          doc.assignedUserIds || oldDeal.assignedUserIds || [];
        assignedUserIds = [...new Set(assignedUserIds.concat(addedUserIds))];
        assignedUserIds = assignedUserIds.filter(
          userId => !removedUserIds.includes(userId)
        );
        doc.assignedUserIds = assignedUserIds;
      }
    }

    return itemsEdit(
      models,
      subdomain,
      _id,
      'deal',
      oldDeal,
      doc,
      proccessId,
      user,
      models.Deals.updateDeal
    );
  },

  /**
   * Change deal
   */
  async dealsChange(
    _root,
    doc: IItemDragCommonFields,
    { user, models, subdomain }: IContext
  ) {
    const deal = await models.Deals.getDeal(doc.itemId);

    if (deal.productsData) {
      const productsData = deal.productsData;

      const stage = await models.Stages.getStage(doc.destinationStageId);
      const prevStage = await models.Stages.getStage(doc.sourceStageId);

      const productIds = productsData.map(p => p.productId);

      if (stage.probability === 'Won' || prevStage.probability === 'Won') {
        const products = await sendProductsMessage({
          subdomain,
          action: 'find',
          data: {
            query: {
              _id: { $in: productIds },
              supply: { $ne: 'unlimited' }
            }
          },
          isRPC: true,
          defaultValue: []
        });

        const multiplier = stage.probability === 'Won' ? -1 : 1;

        await sendProductsMessage({
          subdomain,
          action: 'update',
          data: {
            selector: { _id: { $in: products.map(p => p._id) } },
            modifier: { $inc: { productCount: multiplier } }
          }
        });
      }
    }

    return itemsChange(
      models,
      subdomain,
      doc,
      'deal',
      user,
      models.Deals.updateDeal
    );
  },

  /**
   * Remove deal
   */
  async dealsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsRemove(models, subdomain, _id, 'deal', user);
  },

  /**
   * Watch deal
   */
  async dealsWatch(
    _root,
    { _id, isAdd }: { _id: string; isAdd: boolean },
    { user, models }: IContext
  ) {
    return models.Deals.watchDeal(_id, isAdd, user._id);
  },

  async dealsCopy(
    _root,
    { _id, proccessId }: { _id: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsCopy(
      models,
      subdomain,
      _id,
      proccessId,
      'deal',
      user,
      ['productsData', 'paymentsData'],
      models.Deals.createDeal
    );
  },

  async dealsArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsArchive(models, subdomain, stageId, 'deal', proccessId, user);
  }
};

checkPermission(dealMutations, 'dealsAdd', 'dealsAdd');
checkPermission(dealMutations, 'dealsEdit', 'dealsEdit');
checkPermission(dealMutations, 'dealsRemove', 'dealsRemove');
checkPermission(dealMutations, 'dealsWatch', 'dealsWatch');
checkPermission(dealMutations, 'dealsArchive', 'dealsArchive');

export default dealMutations;
