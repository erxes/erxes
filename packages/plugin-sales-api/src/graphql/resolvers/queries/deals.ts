import {
  checkPermission,
  moduleRequireLogin,
} from '@erxes/api-utils/src/permissions';
import dealResolvers from '../customResolvers/deal';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateDealCommonFilters,
  getItemList,
  IArchiveArgs,
} from './utils';
import { IContext } from '../../../connectionResolver';
import {
  sendCoreMessage,
  sendLoyaltiesMessage
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
      ...(await generateDealCommonFilters(models, subdomain, user._id, args)),
    };

    const getExtraFields = async (item: any) => ({
      amount: await dealResolvers.amount(item),
      unUsedAmount: await dealResolvers.unUsedAmount(item),
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

    serverTiming.startTime('sendCoreMessage');

    const products = await sendCoreMessage({
      subdomain,
      action: 'products.find',
      data: {
        query: {
          _id: { $in: [...new Set(dealProductIds)] },
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    serverTiming.endTime('sendCoreMessage');

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
          product: products.find(p => p._id === pData.productId) || {},
        });
      }

      // do not display to many products
      if (deal.productsData.length > pd.length) {
        deal.products.push({
          product: {
            name: '...More',
          },
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

    return models.Deals.find(filter).countDocuments();
  },

  /**
   * Archived list
   */
  async archivedDeals(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args, models.Deals);
  },

  async archivedDealsCount(_root, args: IArchiveArgs, { models }: IContext) {
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
        $match: filter,
      },
      {
        $lookup: {
          from: 'sales_stages',
          let: { letStageId: '$stageId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$letStageId'],
                },
              },
            },
            {
              $project: {
                probability: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ['$probability', 'Won'] },
                        { $eq: ['$probability', 'Lost'] },
                      ],
                    },
                    then: '$probability',
                    else: 'In progress',
                  },
                },
                probabilityOld: '$probability',
              },
            },
          ],
          as: 'stageProbability',
        },
      },
      {
        $unwind: '$productsData',
      },
      {
        $unwind: '$stageProbability',
      },
      {
        $project: {
          amount: '$productsData.amount',
          currency: '$productsData.currency',
          type: '$stageProbability.probabilityOld',
          tickUsed: '$productsData.tickUsed',
        },
      },
      {
        $match: { tickUsed: true },
      },
      {
        $group: {
          _id: { currency: '$currency', type: '$type' },

          amount: {
            $sum: '$amount',
          },
        },
      },
      {
        $group: {
          _id: '$_id.type',
          currencies: {
            $push: { amount: '$amount', name: '$_id.currency' },
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const forecastedTotal = {};
    const inprogressTotal = {};

    const percentage = p => {
      return Number.parseInt(p.replace('%', '')) / 100;
    };
    amountList
      .filter(type => !['Won', 'Lost'].includes(type._id))
      .map(type => {
        type.currencies.map(currency => {
          if (forecastedTotal[currency.name]) {
            forecastedTotal[currency.name] =
              forecastedTotal[currency.name] +
              currency.amount * percentage(type._id);

            inprogressTotal[currency.name] =
              inprogressTotal[currency.name] + currency.amount;
          } else {
            forecastedTotal[currency.name] =
              currency.amount * percentage(type._id);
            inprogressTotal[currency.name] = currency.amount;
          }
        });
      });
    let currencies = [] as any;
    for (const [key, value] of Object.entries(inprogressTotal)) {
      currencies.push({ name: key, amount: value });
    }
    const inProgress = {
      _id: Math.random(),
      name: 'In progress',
      currencies: currencies,
    };
    currencies = [];
    for (const [key, value] of Object.entries(forecastedTotal)) {
      currencies.push({ name: key, amount: value });
    }
    const forecasted = {
      _id: Math.random(),
      name: 'forecasted 10-90%',
      currencies: currencies,
    };
    amountList.filter(type => ['Won', 'Lost'].includes(type._id));

    const responseArray = amountList
      .filter(type => ['Won', 'Lost'].includes(type._id))
      .map(type => {
        return {
          _id: Math.random(),
          name: type._id,
          currencies: type.currencies,
        };
      });

    responseArray.push(forecasted);
    responseArray.push(inProgress);
    return responseArray;
  },

  /**
   * Deal detail
   */
  async dealDetail(
    _root,
    { _id, clientPortalCard }: { _id: string; clientPortalCard: boolean },
    { user, models }: IContext
  ) {
    const deal = await models.Deals.getDeal(_id);

    // no need to check permission on cp deal
    if (clientPortalCard) {
      return deal;
    }

    return checkItemPermByUser(models, user, deal);
  },

  async checkDiscount(
    _root,
    {
      _id,
      products,
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
        relTypes: ['customer'],
      },
      isRPC: true,
      defaultValue: [],
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
          relTypes: ['company'],
        },
        isRPC: true,
        defaultValue: [],
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
        products,
      },
      isRPC: true,
    });
  },
};

moduleRequireLogin(dealQueries);

checkPermission(dealQueries, 'deals', 'showDeals', []);

export default dealQueries;
