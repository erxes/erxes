import * as _ from 'underscore';
import { IItemDragCommonFields } from '../../../models/definitions/boards';
import {
  IPurchase,
  IProductPurchaseData
} from '../../../models/definitions/purchases';
import { ICost } from '../../../models/definitions/costs';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { checkUserIds } from '@erxes/api-utils/src';
import {
  itemResolver,
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove
} from './utils';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { graphqlPubsub } from '../../../configs';
import { EXPENSE_DIVIDE_TYPES } from '../../../models/definitions/constants';

interface IPurchaseEdit extends IPurchase {
  _id: string;
}

const purchaseMutations = {
  /**
   * Edit, Add , Delete expense mutation
   */

  async manageExpenses(
    _root,
    doc: { costObjects: ICost[] },
    { user, models }: IContext
  ) {
    const oldCosts = await models.Costs.find({ status: 'active' }).lean();

    let bulkOps: Array<{
      updateOne: {
        filter: { _id: string };
        update: any;
        upsert?: boolean;
      };
    }> = [];

    const updatedIds: string[] = [];
    for (const cost of doc.costObjects) {
      if (cost._id) {
        updatedIds.push(cost._id);
      }
      const _id = cost._id || Math.random().toString();

      bulkOps.push({
        updateOne: {
          filter: { _id },
          update: {
            ...cost,
            status: 'active',
            createdBy: user._id,
            createdAt: new Date()
          },
          upsert: true
        }
      });
    }

    await models.Costs.bulkWrite(bulkOps);
    const toDeleteCosts = oldCosts.filter(
      cost => !updatedIds.includes(cost._id)
    );

    bulkOps = [];
    for (const cost of toDeleteCosts) {
      bulkOps.push({
        updateOne: {
          filter: { _id: cost._id || '' },

          update: {
            $set: { status: 'deleted' }
          }
        }
      });
    }
    if (bulkOps.length) {
      await models.Costs.bulkWrite(bulkOps);
    }
    return models.Costs.find({ status: 'active' }).lean();
  },

  // create new purchase
  async purchasesAdd(
    _root,
    doc: IPurchase & { proccessId: string; aboveItemId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsAdd(
      models,
      subdomain,
      doc,
      'purchase',
      models.Purchases.createPurchase,
      user
    );
  },

  /**
   * Edits a purchase
   */
  async purchasesEdit(
    _root,
    { _id, proccessId, ...doc }: IPurchaseEdit & { proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    const oldpurchase = await models.Purchases.getPurchase(_id);

    if (doc.assignedUserIds) {
      const { removedUserIds } = checkUserIds(
        oldpurchase.assignedUserIds,
        doc.assignedUserIds
      );
      const oldAssignedUserPdata = (oldpurchase.productsData || [])
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

      const oldAssignedUserPdata = (oldpurchase.productsData || [])
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || '');

      const { addedUserIds, removedUserIds } = checkUserIds(
        oldAssignedUserPdata,
        assignedUsersPdata
      );

      if (addedUserIds.length > 0 || removedUserIds.length > 0) {
        let assignedUserIds =
          doc.assignedUserIds || oldpurchase.assignedUserIds || [];
        assignedUserIds = [...new Set(assignedUserIds.concat(addedUserIds))];
        assignedUserIds = assignedUserIds.filter(
          userId => !removedUserIds.includes(userId)
        );
        doc.assignedUserIds = assignedUserIds;
      }
    }

    if (
      doc.expensesData &&
      doc.expensesData.length &&
      doc.productsData &&
      doc.productsData.length
    ) {
      const dataOfQuantity = doc.expensesData.filter(
        ed => ed.type === EXPENSE_DIVIDE_TYPES.QUANTITY
      );
      const dataOfAmount = doc.expensesData.filter(
        ed => ed.type === EXPENSE_DIVIDE_TYPES.AMOUNT
      );

      for (const pdata of doc.productsData) {
        pdata.costPrice = 0;
      }

      if (dataOfQuantity.length) {
        const sumOfQuantity = dataOfQuantity
          .map((item: any) => Number(item.price))
          .reduce((sum: any, currency: any) => sum + currency, 0);

        const sumQuantity = doc.productsData
          .map((item: any) => Number(item.quantity))
          .reduce((sum: any, currency: any) => sum + currency, 0);

        const perExpense = sumOfQuantity / sumQuantity;

        for (const pdata of doc.productsData) {
          pdata.costPrice = perExpense * pdata.quantity;
        }
      }
      if (dataOfAmount.length) {
        const sumOfAmount = dataOfAmount
          .map((item: any) => Number(item.price))
          .reduce((sum: any, currency: any) => sum + currency, 0);

        const sumAmount = doc.productsData
          .map((item: any) => item.amount)
          .reduce((sum: any, currency: any) => sum + currency, 0);

        const perExpense = sumOfAmount / sumAmount;

        for (const pdata of doc.productsData) {
          pdata.costPrice += perExpense * (pdata.amount || 0);
        }
      }
    }

    return itemsEdit(
      models,
      subdomain,
      _id,
      'purchase',
      oldpurchase,
      doc,
      proccessId,
      user,
      models.Purchases.updatePurchase
    );
  },

  /**
   * Change purchase
   */
  async purchasesChange(
    _root,
    doc: IItemDragCommonFields,
    { user, models, subdomain }: IContext
  ) {
    return itemsChange(
      models,
      subdomain,
      doc,
      'purchase',
      user,
      models.Purchases.updatePurchase
    );
  },

  /**
   * Remove purchase
   */
  async purchasesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsRemove(models, subdomain, _id, 'purchase', user);
  },

  /**
   * Watch purchase
   */
  async purchasesWatch(
    _root,
    { _id, isAdd }: { _id: string; isAdd: boolean },
    { user, models }: IContext
  ) {
    return models.Purchases.watchPurchase(_id, isAdd, user._id);
  },

  async purchasesCopy(
    _root,
    { _id, proccessId }: { _id: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsCopy(
      models,
      subdomain,
      _id,
      proccessId,
      'purchase',
      user,
      ['productsData', 'paymentsData', 'expensesData'],
      models.Purchases.createPurchase
    );
  },

  async purchasesArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsArchive(
      models,
      subdomain,
      stageId,
      'purchase',
      proccessId,
      user
    );
  },

  async purchasesCreateProductsData(
    _root,
    {
      proccessId,
      purchaseId,
      docs
    }: {
      proccessId: string;
      purchaseId: string;
      docs: IProductPurchaseData[];
    },
    { models, subdomain, user }: IContext
  ) {
    const purchase = await models.Purchases.getPurchase(purchaseId);
    const oldDataIds = (purchase.productsData || []).map(pd => pd._id);

    for (const doc of docs) {
      if (doc._id) {
        const checkDup = (purchase.productsData || []).find(
          pd => pd._id === doc._id
        );
        if (checkDup) {
          throw new Error('Purchases productData duplicated');
        }
      }
    }

    const productsData = (purchase.productsData || []).concat(docs);
    await models.Purchases.updateOne(
      { _id: purchaseId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(purchase.stageId);
    const updatedItem =
      (await models.Purchases.findOne({ _id: purchaseId })) || ({} as any);

    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: 'itemUpdate',
        data: {
          item: {
            ...updatedItem,
            ...(await itemResolver(
              models,
              subdomain,
              user,
              'purchase',
              updatedItem
            ))
          }
        }
      }
    });

    const dataIds = (updatedItem.productsData || [])
      .filter(pd => !oldDataIds.includes(pd._id))
      .map(pd => pd._id);

    graphqlPubsub.publish('productsDataChanged', {
      productsDataChanged: {
        _id: purchaseId,
        proccessId,
        action: 'create',
        data: {
          dataIds,
          docs,
          productsData
        }
      }
    });

    return {
      dataIds,
      productsData
    };
  },

  async purchasesEditProductData(
    _root,
    {
      proccessId,
      purchaseId,
      dataId,
      doc
    }: {
      proccessId: string;
      purchaseId: string;
      dataId: string;
      doc: IProductPurchaseData;
    },
    { models, subdomain, user }: IContext
  ) {
    const purchase = await models.Purchases.getPurchase(purchaseId);
    const oldPData = (purchase.productsData || []).find(
      pdata => pdata.id === dataId
    );

    if (!oldPData) {
      throw new Error('purchases productData not found');
    }

    const productsData = (purchase.productsData || []).map(data =>
      data.id === dataId ? { ...doc } : data
    );

    await models.Purchases.updateOne(
      { _id: purchaseId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(purchase.stageId);
    const updatedItem =
      (await models.Purchases.findOne({ _id: purchaseId })) || ({} as any);

    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: 'itemUpdate',
        data: {
          item: {
            ...updatedItem,
            ...(await itemResolver(
              models,
              subdomain,
              user,
              'purchase',
              updatedItem
            ))
          }
        }
      }
    });

    graphqlPubsub.publish('productsDataChanged', {
      productsDataChanged: {
        _id: purchaseId,
        proccessId,
        action: 'edit',
        data: {
          dataId,
          doc,
          productsData
        }
      }
    });

    return {
      dataId,
      productsData
    };
  },

  async purchasesDeleteProductData(
    _root,
    {
      proccessId,
      purchaseId,
      dataId
    }: {
      proccessId: string;
      purchaseId: string;
      dataId: string;
    },
    { models, subdomain, user }: IContext
  ) {
    const purchase = await models.Purchases.getPurchase(purchaseId);

    const oldPData = (purchase.productsData || []).find(
      pdata => pdata.id === dataId
    );

    if (!oldPData) {
      throw new Error('purchases productData not found');
    }

    const productsData = (purchase.productsData || []).filter(
      data => data.id !== dataId
    );

    await models.Purchases.updateOne(
      { _id: purchaseId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(purchase.stageId);
    const updatedItem =
      (await models.Purchases.findOne({ _id: purchaseId })) || ({} as any);

    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: 'itemUpdate',
        data: {
          item: {
            ...updatedItem,
            ...(await itemResolver(
              models,
              subdomain,
              user,
              'purchase',
              updatedItem
            ))
          }
        }
      }
    });

    graphqlPubsub.publish('productsDataChanged', {
      productsDataChanged: {
        _id: purchaseId,
        proccessId,
        action: 'delete',
        data: {
          dataId,
          productsData
        }
      }
    });

    return {
      dataId,
      productsData
    };
  }
};

checkPermission(purchaseMutations, 'purchasesAdd', 'purchasesAdd');
checkPermission(purchaseMutations, 'purchasesEdit', 'purchasesEdit');
checkPermission(
  purchaseMutations,
  'purchasesCreateProductsData',
  'purchasesEdit'
);
checkPermission(purchaseMutations, 'purchasesEditProductData', 'purchasesEdit');
checkPermission(
  purchaseMutations,
  'purchasesDeleteProductData',
  'purchasesEdit'
);
checkPermission(purchaseMutations, 'purchasesRemove', 'purchasesRemove');
checkPermission(purchaseMutations, 'purchasesWatch', 'purchasesWatch');
checkPermission(purchaseMutations, 'purchasesArchive', 'purchasesArchive');

export default purchaseMutations;
