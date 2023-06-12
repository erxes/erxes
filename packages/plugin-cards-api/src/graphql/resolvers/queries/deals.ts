import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import dealResolvers from '../customResolvers/deal';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateDealCommonFilters,
  getItemList,
  IArchiveArgs
} from './utils';
import { IContext } from '../../../connectionResolver';
import {
  sendCoreMessage,
  sendLoyaltiesMessage,
  sendProductsMessage
} from '../../../messageBroker';

interface IDealListParams extends IListParams {
  productIds?: [string];
}

const dealQueries = {
  /**
   * Deals list
   */
  async deals(
    _root,
    args: IDealListParams,
    { user, models, subdomain, serverTiming }: IContext
  ) {
    const filter = {
      ...(await generateDealCommonFilters(models, subdomain, user._id, args))
    };

    const getExtraFields = async (item: any) => ({
      amount: await dealResolvers.amount(item),
      unUsedAmount: await dealResolvers.unUsedAmount(item)
    });

    const deals = await getItemList(
      models,
      subdomain,
      filter,
      args,
      user,
      'deal',
      { productsData: 1 },
      getExtraFields,
      serverTiming
    );

    // @ts-ignore
    const dealProductIds = deals.flatMap(deal => {
      if (deal.productsData && deal.productsData.length > 0) {
        return deal.productsData.flatMap(pData => pData.productId || []);
      }

      return [];
    });

    serverTiming.startTime('sendProductsMessage');

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          _id: { $in: [...new Set(dealProductIds)] }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    serverTiming.endTime('sendProductsMessage');

    for (const deal of deals) {
      let pd = deal.productsData;

      if (!pd || pd.length === 0) {
        continue;
      }

      deal.products = [];

      // do not display to many products
      pd = pd.splice(0, 10);

      for (const pData of pd) {
        if (!pData.productId) {
          continue;
        }

        deal.products.push({
          ...(typeof pData.toJSON === 'function' ? pData.toJSON() : pData),
          product: products.find(p => p._id === pData.productId) || {}
        });
      }

      // do not display to many products
      if (deal.productsData.length > pd.length) {
        deal.products.push({
          product: {
            name: '...More'
          }
        });
      }
    }

    return deals;
  },

  async dealsTotalCount(
    _root,
    args: IDealListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = await generateDealCommonFilters(
      models,
      subdomain,
      user._id,
      args
    );

    return models.Deals.find(filter).count();
  },

  /**
   * Archived list
   */
  archivedDeals(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args, models.Deals);
  },

  archivedDealsCount(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItemsCount(models, args, models.Deals);
  },

  /**
   *  Deal total amounts
   */
  async dealsTotalAmounts(
    _root,
    args: IDealListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = await generateDealCommonFilters(
      models,
      subdomain,
      user._id,
      args
    );

    const amountList = await models.Deals.aggregate([
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
   * Deal detail
   */
  async dealDetail(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext
  ) {
    const deal = await models.Deals.getDeal(_id);

    return checkItemPermByUser(models, user, deal);
  },

  async checkDiscount(
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
        mainType: 'deal',
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
          mainType: 'deal',
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

moduleRequireLogin(dealQueries);

checkPermission(dealQueries, 'deals', 'showDeals', []);

export default dealQueries;
