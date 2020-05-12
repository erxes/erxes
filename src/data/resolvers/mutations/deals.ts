import * as _ from 'underscore';
import { ActivityLogs, Checklists, Conformities, Deals, Stages } from '../../../db/models';
import { getCompanies, getCustomers } from '../../../db/models/boardUtils';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { BOARD_STATUSES, BOARD_TYPES, NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IDeal } from '../../../db/models/definitions/deals';
import { graphqlPubsub } from '../../../pubsub';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { checkUserIds } from '../../utils';
import {
  copyChecklists,
  copyPipelineLabels,
  createConformity,
  IBoardNotificationParams,
  itemsChange,
  prepareBoardItemDoc,
  sendNotifications,
} from '../boardUtils';

interface IDealsEdit extends IDeal {
  _id: string;
}

const dealMutations = {
  /**
   * Creates a new deal
   */
  async dealsAdd(_root, doc: IDeal, { user, docModifier }: IContext) {
    doc.initialStageId = doc.stageId;
    doc.watchedUserIds = [user._id];

    const extendedDoc = {
      ...docModifier(doc),
      modifiedBy: user._id,
      userId: user._id,
    };

    const deal = await Deals.createDeal(extendedDoc);

    await sendNotifications({
      item: deal,
      user,
      type: NOTIFICATION_TYPES.DEAL_ADD,
      action: 'invited you to the deal',
      content: `'${deal.name}'.`,
      contentType: MODULE_NAMES.DEAL,
    });

    await putCreateLog(
      {
        type: MODULE_NAMES.DEAL,
        newData: extendedDoc,
        object: deal,
      },
      user,
    );

    return deal;
  },

  /**
   * Edits a deal
   */
  async dealsEdit(_root, { _id, ...doc }: IDealsEdit, { user }: IContext) {
    const oldDeal = await Deals.getDeal(_id);
    let checkedAssignUserIds: { addedUserIds?: string[]; removedUserIds?: string[] } = {};

    if (doc.assignedUserIds) {
      const { addedUserIds, removedUserIds } = checkUserIds(oldDeal.assignedUserIds, doc.assignedUserIds);
      const oldAssignedUserPdata = (oldDeal.productsData || [])
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || '');
      const cantRemoveUserIds = removedUserIds.filter(userId => oldAssignedUserPdata.includes(userId));

      if (cantRemoveUserIds.length > 0) {
        throw new Error('Cannot remove the team member, it is assigned in the product / service section');
      }

      checkedAssignUserIds = { addedUserIds, removedUserIds };
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

        checkedAssignUserIds = checkUserIds(oldDeal.assignedUserIds, assignedUserIds);
      }
    }

    const extendedDoc = {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    };

    const updatedDeal = await Deals.updateDeal(_id, extendedDoc);

    await copyPipelineLabels({ item: oldDeal, doc, user });

    const notificationDoc: IBoardNotificationParams = {
      item: updatedDeal,
      user,
      type: NOTIFICATION_TYPES.DEAL_EDIT,
      action: `has updated deal`,
      content: `${updatedDeal.name}`,
      contentType: MODULE_NAMES.DEAL,
    };

    if (doc.status && oldDeal.status && oldDeal.status !== doc.status) {
      const activityAction = doc.status === 'active' ? 'activated' : 'archived';

      await ActivityLogs.createArchiveLog({
        item: updatedDeal,
        contentType: 'deal',
        action: activityAction,
        userId: user._id,
      });
    }

    if (Object.keys(checkedAssignUserIds).length > 0) {
      const { addedUserIds, removedUserIds } = checkedAssignUserIds;

      const activityContent = { addedUserIds, removedUserIds };

      await ActivityLogs.createAssigneLog({
        contentId: _id,
        userId: user._id,
        contentType: 'deal',
        content: activityContent,
      });

      notificationDoc.invitedUsers = addedUserIds;
      notificationDoc.removedUsers = removedUserIds;
    }

    await sendNotifications(notificationDoc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.DEAL,
        object: oldDeal,
        newData: extendedDoc,
        updatedDocument: updatedDeal,
      },
      user,
    );

    if (oldDeal.stageId === updatedDeal.stageId) {
      graphqlPubsub.publish('dealsChanged', {
        dealsChanged: updatedDeal,
        user,
      });

      return updatedDeal;
    }

    // if deal moves between stages
    const { content, action } = await itemsChange(user._id, oldDeal, MODULE_NAMES.DEAL, updatedDeal.stageId);

    await sendNotifications({
      item: updatedDeal,
      user,
      type: NOTIFICATION_TYPES.DEAL_CHANGE,
      content,
      action,
      contentType: MODULE_NAMES.DEAL,
    });

    const updatedStage = await Stages.getStage(updatedDeal.stageId);
    const oldStage = await Stages.getStage(oldDeal.stageId);

    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: updatedStage.pipelineId,
        type: BOARD_TYPES.DEAL,
      },
      user,
    });

    if (updatedStage.pipelineId !== oldStage.pipelineId) {
      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: oldStage.pipelineId,
          type: BOARD_TYPES.DEAL,
        },
        user,
      });
    }

    return updatedDeal;
  },

  /**
   * Change deal
   */
  async dealsChange(
    _root,
    { _id, destinationStageId, order }: { _id: string; destinationStageId: string; order: number },
    { user }: IContext,
  ) {
    const deal = await Deals.getDeal(_id);

    const extendedDoc = {
      modifiedAt: new Date(),
      modifiedBy: user._id,
      stageId: destinationStageId,
      order,
    };

    const updatedDeal = await Deals.updateDeal(_id, extendedDoc);

    const { content, action } = await itemsChange(user._id, deal, MODULE_NAMES.DEAL, destinationStageId);

    await sendNotifications({
      item: deal,
      user,
      type: NOTIFICATION_TYPES.DEAL_CHANGE,
      content,
      action,
      contentType: MODULE_NAMES.DEAL,
    });

    await putUpdateLog(
      {
        type: MODULE_NAMES.DEAL,
        object: deal,
        newData: extendedDoc,
        updatedDocument: updatedDeal,
      },
      user,
    );

    // if move between stages
    if (destinationStageId !== deal.stageId) {
      const stage = await Stages.getStage(deal.stageId);

      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: stage.pipelineId,
          type: BOARD_TYPES.DEAL,
        },
        user,
      });
    }

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
  async dealsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const deal = await Deals.getDeal(_id);

    await sendNotifications({
      item: deal,
      user,
      type: NOTIFICATION_TYPES.DEAL_DELETE,
      action: `deleted deal:`,
      content: `'${deal.name}'`,
      contentType: MODULE_NAMES.DEAL,
    });

    await Conformities.removeConformity({ mainType: MODULE_NAMES.DEAL, mainTypeId: deal._id });
    await Checklists.removeChecklists(MODULE_NAMES.DEAL, deal._id);
    await ActivityLogs.removeActivityLog(deal._id);

    const removed = await deal.remove();

    await putDeleteLog({ type: MODULE_NAMES.DEAL, object: deal }, user);

    return removed;
  },

  /**
   * Watch deal
   */
  async dealsWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: IContext) {
    return Deals.watchDeal(_id, isAdd, user._id);
  },

  async dealsCopy(_root, { _id }: { _id: string }, { user }: IContext) {
    const deal = await Deals.getDeal(_id);

    const doc = await prepareBoardItemDoc(_id, 'deal', user._id);

    doc.productsData = deal.productsData;
    doc.paymentsData = deal.paymentsData;

    const clone = await Deals.createDeal(doc);

    const companies = await getCompanies('deal', _id);
    const customers = await getCustomers('deal', _id);

    await createConformity({
      mainType: 'deal',
      mainTypeId: clone._id,
      customerIds: customers.map(c => c._id),
      companyIds: companies.map(c => c._id),
    });

    await copyChecklists({
      contentType: 'deal',
      contentTypeId: deal._id,
      targetContentId: clone._id,
      user,
    });

    return clone;
  },

  async dealsArchive(_root, { stageId }: { stageId: string }, { user }: IContext) {
    const updatedDeal = await Deals.updateMany({ stageId }, { $set: { status: BOARD_STATUSES.ARCHIVED } });

    await ActivityLogs.createArchiveLog({
      item: updatedDeal,
      contentType: 'deal',
      action: 'archived',
      userId: user._id,
    });

    return 'ok';
  },
};

checkPermission(dealMutations, 'dealsAdd', 'dealsAdd');
checkPermission(dealMutations, 'dealsEdit', 'dealsEdit');
checkPermission(dealMutations, 'dealsUpdateOrder', 'dealsUpdateOrder');
checkPermission(dealMutations, 'dealsRemove', 'dealsRemove');
checkPermission(dealMutations, 'dealsWatch', 'dealsWatch');
checkPermission(dealMutations, 'dealsArchive', 'dealsArchive');

export default dealMutations;
