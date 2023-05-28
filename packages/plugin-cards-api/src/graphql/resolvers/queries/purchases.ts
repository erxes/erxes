import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import purchaseResolvers from '../customResolvers/purchase';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generatePurchaseCommonFilters,
  getItemList,
  IArchiveArgs
} from './utils';
import { IContext } from '../../../connectionResolver';
import {
  sendCoreMessage,
  sendLoyaltiesMessage,
  sendProductsMessage
} from '../../../messageBroker';

interface IPurchaseListParams extends IListParams {
  productIds?: [string];
}

const purchaseQueries = {
  //list cost
  async costs(_root, _args, { models }: IContext) {
    return models.Costs.find({ status: 'active' }).lean();
  },

  //count cost
  async costTotalCount(_root, _args, { models }: IContext) {
    return models.Costs.countDocuments();
  },
  //cost detail
  async costDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Costs.findOne({ _id });
  },

  // purchase list
  async purchases(
    _root,
    args: IPurchaseListParams,
    { user, models, subdomain, serverTiming }: IContext
  ) {
    const filter = {
      ...(await generatePurchaseCommonFilters(
        models,
        subdomain,
        user._id,
        args
      ))
    };

    const getExtraFields = async (item: any) => ({
      amount: await purchaseResolvers.amount(item)
    });

    const purchases = await getItemList(
      models,
      subdomain,
      filter,
      args,
      user,
      'purchase',
      { productsData: 1 },
      getExtraFields,
      serverTiming
    );

    // @ts-ignore
    const purchaseProductIds = purchases.flatMap(purchase => {
      if (purchase.productsData && purchase.productsData.length > 0) {
        return purchase.productsData.flatMap(pData => pData.productId || []);
      }

      return [];
    });

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          _id: { $in: [...new Set(purchaseProductIds)] }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const purchaseExpenseIds = purchases.flatMap(purchase => {
      if (purchase.expensesData && purchase.expensesData.length > 0) {
        return purchase.expensesData.flatMap(pData => pData.expenseId || []);
      }
    });

    const expenses = await models.Costs.find({
      _id: { $in: [...new Set(purchaseExpenseIds)] }
    }).lean();

    for (const purchase of purchases) {
      let pd = purchase.productsData;

      if (!pd || pd.length === 0) {
        continue;
      }

      purchase.products = [];

      // do not display to many products
      pd = pd.splice(0, 10);

      for (const pData of pd) {
        if (!pData.productId) {
          continue;
        }

        purchase.products.push({
          ...(typeof pData.toJSON === 'function' ? pData.toJSON() : pData),
          product: products.find(p => p._id === pData.productId) || {}
        });
      }

      // do not display to many products
      if (purchase.productsData.length > pd.length) {
        purchase.products.push({
          product: {
            name: '...More'
          }
        });
      }

      if (purchase.expensesData && purchase.expensesData.length > 0) {
        purchase.expensesData.forEach((expense, ind) => {
          if (expense.expenseId) {
            purchase.expensesData[ind] =
              expenses.find(e => e._id === expense.expenseId) || {};
          }
        });
      }
    }

    return purchases;
  },

  async purchasesTotalCount(
    _root,
    args: IPurchaseListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = await generatePurchaseCommonFilters(
      models,
      subdomain,
      user._id,
      args
    );

    return models.Purchases.find(filter).count();
  },

  /**
   * Archived list
   */
  archivedpurchases(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args, models.Purchases);
  },

  archivedpurchasesCount(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItemsCount(models, args, models.Purchases);
  },

  /**
   *  purchase total amounts
   */
  async purchasesTotalAmounts(
    _root,
    args: IPurchaseListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = await generatePurchaseCommonFilters(
      models,
      subdomain,
      user._id,
      args
    );

    const amountList = await models.Purchases.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'stages',
          let: { letStageId: '$stageId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$letStageId']
                }
              }
            },
            {
              $project: {
                probability: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ['$probability', 'Won'] },
                        { $eq: ['$probability', 'Lost'] }
                      ]
                    },
                    then: '$probability',
                    else: 'In progress'
                  }
                }
              }
            }
          ],
          as: 'stageProbability'
        }
      },
      {
        $unwind: '$productsData'
      },
      {
        $unwind: '$stageProbability'
      },
      {
        $project: {
          amount: '$productsData.amount',
          currency: '$productsData.currency',
          type: '$stageProbability.probability',
          tickUsed: '$productsData.tickUsed'
        }
      },
      {
        $match: { tickUsed: true }
      },
      {
        $group: {
          _id: { currency: '$currency', type: '$type' },

          amount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          currencies: {
            $push: { amount: '$amount', name: '$_id.currency' }
          }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    return amountList.map(type => {
      return {
        _id: Math.random(),
        name: type._id,
        currencies: type.currencies
      };
    });
  },

  /**
   * purchase detail
   */
  async purchaseDetail(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext
  ) {
    const purchase = await models.Purchases.getPurchase(_id);

    return checkItemPermByUser(models, user, purchase);
  },

  async purchasecheckDiscount(
    _root,
    {
      _id,
      products
    }: {
      _id: string;
      products: Array<{ productId: string; quantity: number }>;
    },
    { subdomain }: IContext
  ) {
    let ownerId = '';
    let ownerType = '';
    const customerIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'purchase',
        mainTypeId: _id,
        relTypes: ['customer']
      },
      isRPC: true,
      defaultValue: []
    });

    if (customerIds.length) {
      ownerId = customerIds[0];
      ownerType = 'customer';
    }

    if (!ownerId) {
      const companyIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: 'purchase',
          mainTypeId: _id,
          relTypes: ['company']
        },
        isRPC: true,
        defaultValue: []
      });
      if (companyIds.length) {
        ownerId = companyIds[0];
        ownerType = 'company';
      }
    }

    if (!ownerId) {
      return null;
    }

    return await sendLoyaltiesMessage({
      subdomain,
      action: 'checkLoyalties',
      data: {
        ownerType,
        ownerId,
        products
      },
      isRPC: true
    });
  }
};

moduleRequireLogin(purchaseQueries);

checkPermission(purchaseQueries, 'purchases', 'showPurchases', []);

export default purchaseQueries;
