import * as _ from 'underscore';
import { IItemDragCommonFields } from '../../../models/definitions/boards';
import {
  IPurchase,
  IProductPurchaseData
} from '../../../models/definitions/purchase';

import { ICost, ICostDocument } from '../../../models/definitions/cost';

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
import purchase from '../customResolvers/purchase';
import { doc } from 'prettier';

interface IPurchaseEdit extends IPurchase {
  _id: string;
}

interface ICostEdit extends ICost {
  _id: string;
}

const purchaseMutations = {
  // first cost result
  async costPriceResult(
    _root,
    doc: any,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const cost = await models.Costs.find().lean();
    if (!cost) {
      throw new Error('cost not found');
    }
    const quantity = doc.quantity;
    let sum = cost
      .map(o => parseInt(o.price))
      .reduce((a, c) => {
        return a + c;
      });
  },

  // add cost
  async costAdd(
    _root,
    doc: ICost,
    { user, docModifier, models, subdomain }: IContext
  ) {
    // const data = await models.Costs.createCost(docModifier(doc));
    // return data;
    return models.Costs.insertMany(doc.data);
  },

  //edit cost
  async costEdit(
    _root,
    { _id, ...doc }: ICostEdit,
    { user, models, subdomain }: IContext
  ) {
    const updated = await models.Costs.updateCost(_id, doc);
    return updated;
  },

  //remove cost
  async costRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Costs.removeCost(_id);
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
      models.Purchase.createPurchase,
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
    const oldpurchase = await models.Purchase.getPurchase(_id);

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

    return itemsEdit(
      models,
      subdomain,
      _id,
      'purchase',
      oldpurchase,
      doc,
      proccessId,
      user,
      models.Purchase.updatePurchase
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
    const purchase = await models.Purchase.getPurchase(doc.itemId);

    if (purchase.productsData) {
      const productsData = purchase.productsData;

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
      'purchase',
      user,
      models.Purchase.updatePurchase
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
    return models.Purchase.watchPurchase(_id, isAdd, user._id);
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
      ['productsData', 'paymentsData'],
      models.Purchase.createPurchase
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
    const purchase = await models.Purchase.getPurchase(purchaseId);
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
    await models.Purchase.updateOne(
      { _id: purchaseId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(purchase.stageId);
    const updatedItem =
      (await models.Purchase.findOne({ _id: purchaseId })) || ({} as any);

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
    const purchase = await models.Purchase.getPurchase(purchaseId);
    const oldPData = (purchase.productsData || []).find(
      pdata => pdata.id === dataId
    );

    if (!oldPData) {
      throw new Error('purchases productData not found');
    }

    const productsData = (purchase.productsData || []).map(data =>
      data.id === dataId ? { ...doc } : data
    );

    await models.Purchase.updateOne(
      { _id: purchaseId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(purchase.stageId);
    const updatedItem =
      (await models.Purchase.findOne({ _id: purchaseId })) || ({} as any);

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
    const purchase = await models.Purchase.getPurchase(purchaseId);

    const oldPData = (purchase.productsData || []).find(
      pdata => pdata.id === dataId
    );

    if (!oldPData) {
      throw new Error('purchases productData not found');
    }

    const productsData = (purchase.productsData || []).filter(
      data => data.id !== dataId
    );

    await models.Purchase.updateOne(
      { _id: purchaseId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(purchase.stageId);
    const updatedItem =
      (await models.Purchase.findOne({ _id: purchaseId })) || ({} as any);

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
