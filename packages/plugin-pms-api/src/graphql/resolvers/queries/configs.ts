import { requireLogin } from '@erxes/api-utils/src/permissions';

import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage, sendSalesMessage } from '../../../messageBroker';

dotenv.config();

const configQueries = {
  /**
   * Config object
   */
  async pmsConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  async pmsConfigsGetValue(
    _root,
    { code }: { code: string },
    { models }: IContext
  ) {
    return await models.Configs.findOne({ code }).lean();
  },

  async pmsRooms(
    _root,
    {
      endDate1,
      endDate2,
      startDate1,
      startDate2,
      pipelineId,
    }: {
      startDate1: Date;
      startDate2: Date;
      endDate1: Date;
      endDate2: Date;
      pipelineId: string;
    },
    { models, subdomain }: IContext
  ) {
    const stages = await sendSalesMessage({
      subdomain,
      action: 'stages.find',
      data: {
        pipelineId: pipelineId,
      },
      isRPC: true,
    });
    const stageIds = stages.map(x => x._id) || [];
    const deals = await sendSalesMessage({
      subdomain,
      action: 'deals.find',
      data: {
        stageId: { $in: stageIds },
        productsData: {
          $elemMatch: {
            startDate: {
              $gte: new Date(startDate1),
              $lte: new Date(startDate2),
            },
            endDate: {
              $gte: new Date(endDate1),
              $lte: new Date(endDate2),
            },
          },
        },
      },
      isRPC: true,
    });
    console.log('deals');
    console.log(deals);
    return deals;
  },
  async pmsCheckRooms(
    _root,
    {
      ids,
      endDate,
      startDate,
      pipelineId,
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      ids: string[];
    },
    { models, subdomain }: IContext
  ) {
    const stages = await sendSalesMessage({
      subdomain,
      action: 'stages.find',
      data: {
        pipelineId: pipelineId,
      },
      isRPC: true,
    });
    const stageIds = stages.map(x => x._id) || [];
    const deals = await sendSalesMessage({
      subdomain,
      action: 'deals.find',
      data: {
        stageId: { $in: stageIds },
        productsData: {
          $elemMatch: {
            $or: [
              {
                productId: { $in: ids },
                startDate: {
                  $lte: new Date(startDate),
                },
                endDate: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              },
              {
                productId: { $in: ids },
                startDate: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              },
            ],
          },
        },
      },
      isRPC: true,
    });
    const array: any[] = [];
    for (const x of deals) {
      array.push(...(x?.productsData || []));
    }
    const productsFiltered = array.filter(productData => {
      if (!ids.includes(productData.productId)) {
        return false;
      }
      if (productData.startDate && productData.endDate) {
        if (
          new Date(productData.startDate) <= new Date(startDate) &&
          new Date(startDate) <= new Date(productData.endDate) &&
          new Date(endDate) >= new Date(productData.endDate)
        ) {
          return true;
        }
        if (
          new Date(startDate) <= new Date(productData.startDate) &&
          new Date(endDate) >= new Date(productData.startDate)
        ) {
          return true;
        }
        return false;
      } else return false;
    });

    const productIds = productsFiltered.map(x => x.productId);
    console.log(ids.filter(x => !productIds.includes(x)));
    return (
      ids.filter(x => !productIds.includes(x)).map(x => ({ _id: x })) || []
    );
  },
  async pmsRoomCleaningList(
    _root,
    {
      ids,
      endDate,
      startDate,
      pipelineId,
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      ids: string[];
    },
    { models, subdomain }: IContext
  ) {},
};

// requireLogin(configQueries, 'pmsConfigs');

export default configQueries;
