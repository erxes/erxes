import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendCardsMessage } from '../../../messageBroker';
import { ITracking, ITrackingItem } from '../../../models/definitions/trips';
import { ITrackingData } from '../../../models/definitions/tumentechDeal';

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
      pipelineId,
      isFilterCreatedBy
    }: {
      dealId?: string;
      dealIds?: [string];
      page?: number;
      perPage?: number;
      stageId?: string;
      driverType?: number;
      pipelineId?: string;
      isFilterCreatedBy?: boolean | false;
    },
    { models, subdomain, cpUser }: IContext
  ) => {
    const filter: any = {};

    if (isFilterCreatedBy) {
      filter.createdBy = cpUser.userId;
    }

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
          dealId: { $in: dealsIdsList },
          ...(isFilterCreatedBy && { createdBy: cpUser.userId })
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
          ...(isFilterCreatedBy && { createdBy: cpUser.userId })
          // driverType,
        }).count()
      };
    }
    if (pipelineId) {
      const stages = await sendCardsMessage({
        subdomain,
        action: 'stages.find',
        data: { pipelineId },
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
          dealId: { $in: dealsIdsList },
          ...(isFilterCreatedBy && { createdBy: cpUser.userId })
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
          ...(isFilterCreatedBy && { createdBy: cpUser.userId }),
          dealId: { $in: dealsIdsList }
          // driverType,
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

    if (tumenDeals?.length > 0) {
      return tumenDeals[0];
    }
    return null;
  },

  tumentechDealDetail: async (
    _root,
    {
      _id,
      dealId,
      isFilterCreatedBy
    }: { _id: string; dealId?: string; isFilterCreatedBy?: boolean },
    { models, cpUser }: IContext
  ) => {
    if (dealId) {
      return models.TumentechDeals.getTumentechDeal(
        _id,
        dealId,
        isFilterCreatedBy ? cpUser.userId : undefined
      );
    }

    return models.TumentechDeals.getTumentechDeal(
      _id,
      '',
      isFilterCreatedBy ? cpUser.userId : undefined
    );
  },

  // get tracking datas with dealId
  tumentechTrackingDatas: async (
    _root,
    { dealId }: { dealId: string },
    { models }: IContext
  ) => {
    const trackingDatas: ITracking[] = await models.Tracking.find({ dealId });

    const sortList = (trackingData: ITrackingItem[]) => {
      const sorted = trackingData.sort((a, b) => a[2] - b[2]);

      return sorted.map(t => ({
        lat: t[0],
        lng: t[1],
        trackedDate: new Date(t[2] * 1000)
      }));
    };

    const sortedData: ITrackingData[] = [];

    for (const trackingData of trackingDatas) {
      const car = await models.Cars.findOne({ _id: trackingData.carId });

      const obj = {
        carId: trackingData.carId,
        car,
        dealId,
        list: sortList(trackingData.trackingData)
      };

      sortedData.push(obj);
    }

    return sortedData;
  },

  tumentechTrackingData: async (
    _root,
    { dealId, carId }: { dealId: string; carId: string },
    { models }: IContext
  ) => {
    const data = await models.Tracking.findOne({ dealId, carId }).lean();

    const sortList = (trackingData: ITrackingItem[]) => {
      const sorted = trackingData.sort((a, b) => a[2] - b[2]);

      return sorted.map(t => ({
        lat: t[0],
        lng: t[1],
        trackedDate: new Date(t[2] * 1000)
      }));
    };

    if (!data) {
      return null;
    }

    const car = await models.Cars.findOne({ _id: carId });

    return {
      carId,
      car,
      dealId,
      list: sortList(data.trackingData)
    };
  }
};

export default tumentechDealsQuery;
