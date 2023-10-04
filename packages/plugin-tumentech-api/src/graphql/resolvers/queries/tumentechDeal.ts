import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendCardsMessage } from '../../../messageBroker';

const tumentechDealsQuery = {
  tumentechDeals: async (
    _root,
    {
      dealId,
      page,
      perPage,
      dealIds,
      stageId,
      driverType,
      pipelineId
    }: {
      dealId?: string;
      dealIds?: [string];
      page?: number;
      perPage?: number;
      stageId?: string;
      driverType?: number;
      pipelineId?: string;
    },
    { models, subdomain }: IContext
  ) => {
    const filter: any = {};

    if (dealIds) {
      filter.dealId = { $in: dealIds || [] };
    }

    if (dealId) {
      filter.dealIds = dealId;
    }
    if (driverType) {
      filter.driverType = driverType;
    }
    const dealQuery: any = {};

    if (stageId) {
      dealQuery.stageId = stageId;
    }

    if (dealQuery.stageId) {
      const deals = await sendCardsMessage({
        subdomain,
        action: 'deals.find',
        data: dealQuery,
        isRPC: true
      });

      const dealsIdsList = deals.map(d => d._id) || [];

      const result = paginate(
        models.TumentechDeals.find({
          dealId: { $in: dealsIdsList }
          // driverType,
        })
          .sort({ createdAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      );

      return {
        list: result,
        totalCount: models.TumentechDeals.find({
          dealId: { $in: dealsIdsList },
          driverType
        }).count()
      };
    }
    if (pipelineId) {
      const stages = await sendCardsMessage({
        subdomain,
        action: 'stages.find',
        data: { pipelineId: pipelineId },
        isRPC: true
      });

      dealQuery.stageId = { $in: (stages || []).map(s => s._id) };

      const deals = await sendCardsMessage({
        subdomain,
        action: 'deals.find',
        data: dealQuery,
        isRPC: true
      });

      const dealsIdsList = deals.map(d => d._id) || [];

      const result = paginate(
        models.TumentechDeals.find({
          dealId: { $in: dealsIdsList }
          // driverType,
        })
          .sort({ createdAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      );

      return {
        list: result,
        totalCount: models.TumentechDeals.find({
          dealId: { $in: dealsIdsList },
          driverType
        }).count()
      };
    }
    return {
      list: paginate(
        models.TumentechDeals.find(filter)
          .sort({ createdAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      ),
      totalCount: models.TumentechDeals.find(filter).count()
    };
  },

  tumentechTripDistance: async (
    _root,
    {
      driverId
    }: {
      driverId?: string;
    },
    { models, subdomain }: IContext
  ) => {
    console.log(driverId);

    // driverIds: driverId,
    const tumenDeals = await models.TumentechDeals.aggregate([
      // Stage 1: Filter documents
      {
        $match: { driverIds: driverId, tripFinishedData: { $ne: null } }
      },
      // Stage 2: Group remaining documents by pizza name and calculate total quantity
      {
        $group: {
          _id: '$driverIds',
          total: { $sum: '$tripDistance' },
          numberOfWorks: { $sum: 1 }
        }
      }
    ]);

    if (tumenDeals?.length > 0) return tumenDeals[0];
    else return null;
  },

  tumentechDealDetail: async (
    _root,
    { _id, dealId }: { _id: string; dealId?: string },
    { models }: IContext
  ) => {
    if (dealId) {
      return models.TumentechDeals.getTumentechDeal(_id, dealId);
    }

    return models.TumentechDeals.getTumentechDeal(_id);
  }
};

export default tumentechDealsQuery;
