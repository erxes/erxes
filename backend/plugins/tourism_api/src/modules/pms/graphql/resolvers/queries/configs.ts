import { Resolver } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const configQueries: Record<string, Resolver> = {
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
      endDate,
      startDate,
      pipelineId,
      perPage = 50,
      page = 1,
      skipStageIds = [],
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      perPage: number;
      page: number;
      skipStageIds: string[];
    },
    { subdomain }: IContext,
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
              startDate: { $lte: new Date(endDate) }, // Document starts before your range ends
              endDate: { $gte: new Date(startDate) }, // Document ends after your range starts
            },
          },
        },
        skip: (page - 1) * perPage,
        limit: perPage,
      },
    });
    return deals?.data || [];
  },

  async cpPmsRooms(
    _root,
    {
      endDate,
      startDate,
      pipelineId,
      perPage = 50,
      page = 1,
      skipStageIds = [],
    }: {
      startDate: Date;
      endDate: Date;
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
              startDate: { $lte: new Date(endDate) }, // Document starts before your range ends
              endDate: { $gte: new Date(startDate) }, // Document ends after your range starts
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

    const searchStart = new Date(startDate);
    const searchEnd = new Date(endDate);

    const deals = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'deal',
      action: 'find',
      input: {
        query: {
          stageId: { $in: newArray },
          // 1. Broad filter: Find any deal that touches our range and has our rooms
          productsData: {
            $elemMatch: { productId: { $in: ids } },
          },
          startDate: { $lt: searchEnd },
          closeDate: { $gt: searchStart },
        },
      },
    });

    const busyProductIds = new Set<string>();

    for (const deal of deals?.data || []) {
      for (const productData of deal.productsData || []) {
        // Ensure we only care about the products the user actually searched for
        if (!ids.includes(productData.productId)) continue;

        // Use the same universal overlap formula for the specific product dates
        // If productData doesn't have dates, fall back to the Deal's root dates
        const pStart = new Date(productData.startDate || deal.startDate);
        const pEnd = new Date(productData.endDate || deal.closeDate);

        const isOverlapping = pStart < searchEnd && pEnd > searchStart;

        if (isOverlapping) {
          busyProductIds.add(productData.productId);
        }
      }
    }

    // Return the IDs that are NOT in the busy list
    return ids
      .filter((id) => !busyProductIds.has(id))
      .map((id) => ({ _id: id }));
  },

  async cpPmsCheckRooms(
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
              productId: { $in: ids },
              startDate: {
                $lte: new Date(endDate), // 🔥 important
              },
              endDate: {
                $gte: new Date(startDate), // 🔥 important
              },
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

configQueries.cpPmsCheckRooms.wrapperConfig = {
  forClientPortal: true,
};

configQueries.cpPmsRooms.wrapperConfig = {
  forClientPortal: true,
};
