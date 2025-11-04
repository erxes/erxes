import { cursorPaginate, sendTRPCMessage } from 'erxes-api-shared/src/utils';
import { IContext } from '~/connectionResolvers';

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
    { models }: IContext,
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
      perPage = 50,
      page = 1,
      skipStageIds = [],
    }: {
      startDate1: Date;
      startDate2: Date;
      endDate1: Date;
      endDate2: Date;
      pipelineId: string;
      perPage: number;
      page: number;
      skipStageIds: string[];
    },
    { models, subdomain }: IContext,
  ) {
    const stages = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'sales',
      module: 'stage',
      action: 'find',
      input: { pipelineId: pipelineId },
    });

    const stageIds = stages.data?.map((x) => x._id) || [];
    const newArray = stageIds.filter((item) => !skipStageIds?.includes(item));

    const deals = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'sales',
      module: 'deal',
      action: 'find',
      input: {
        query: {
          stageId: { $in: newArray },
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
        skip: (page - 1) * perPage,
        limit: perPage,
      },
    });
    return deals?.data || [];
  },
  async pmsCheckRooms(
    _root,
    {
      ids,
      endDate,
      startDate,
      pipelineId,
      skipStageIds = [],
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      ids: string[];
      skipStageIds: string[];
    },
    { models, subdomain }: IContext,
  ) {
    const stages = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'sales',
      module: 'stage',
      action: 'find',
      input: { pipelineId: pipelineId },
    });

    const stageIds = stages?.data.map((x) => x._id) || [];
    const newArray = stageIds.filter((item) => !skipStageIds?.includes(item));

    const deals = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'deal',
      action: 'find',
      input: {
        query: {
          stageId: { $in: newArray },
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
      },
    });
    const array: any[] = [];
    for (const x of deals?.data || []) {
      array.push(...(x?.productsData || []));
    }
    const productsFiltered = array.filter((productData) => {
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

    const productIds = productsFiltered.map((x) => x.productId);
    return (
      ids.filter((x) => !productIds.includes(x)).map((x) => ({ _id: x })) || []
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
    { models, subdomain }: IContext,
  ) {},
};

export default configQueries;
