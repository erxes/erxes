import { paginate } from '@erxes/api-utils/src';

import { IContext, IModels } from '../../../connectionResolver';
import { ServiceStatus } from '../../../models/definitions/buildings';

const buildQuery = async (params: any, models: IModels) => {
  const {
    searchValue,
    cityId,
    districtId,
    quarterId,
    customQuery,
    networkType,
  } = params;
  const filter: any = {};

  if (searchValue) {
    filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
  }

  if (cityId) {
    const districts = await models.Districts.find({ cityId }).select('_id');
    const ones = await models.Quarters.find({
      districtId: { $in: districts.map((d) => d._id) },
    }).select('_id');

    filter.quarterId = { $in: ones.map((d) => d._id) };
  }

  if (districtId) {
    const ones = await models.Quarters.find({
      districtId: districtId,
    }).select('_id');

    filter.quarterId = { $in: ones.map((d) => d._id) };
  }

  if (quarterId) {
    filter.quarterId = quarterId;
  }

  if (networkType) {
    filter.networkType = networkType;
  }

  return { ...filter, ...customQuery };
};

const queries = {
  buildingList: async (_root, params, { models }: IContext) => {
    const filter: any = await buildQuery(params, models);
    const { page, perPage } = params;

    return {
      list: paginate(
        models.Buildings.find(filter).sort({ updatedAt: -1 }).lean(),
        {
          page: page || 1,
          perPage: perPage || 20,
        },
      ),
      totalCount: models.Buildings.find(filter).count(),
    };
  },

  buildings: async (_root, params, { models }: IContext) => {
    const filter: any = await buildQuery(params, models);
    const { page, perPage } = params;

    return paginate(models.Buildings.find(filter).lean(), {
      page: page || 1,
      perPage: perPage || 20,
    });
  },

  buildingDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    const query = {
      $or: [{ _id }, { osmbId: Number(_id) }, { osmbId: _id }],
    };

    return models.Buildings.findOne(query).lean();
  },

  buildingGet: async (
    _root,
    { osmbId }: { osmbId: string },
    { models }: IContext,
  ) => {
    return models.Buildings.getBuilding({ osmbId });
  },

  buildingsByBounds: async (
    _root,
    {
      bounds,
      serviceStatuses,
    }: { bounds: any; serviceStatuses: [ServiceStatus] },
    { models }: IContext,
  ) => {
    const qry: any = {
      location: {
        $geoWithin: { $polygon: bounds },
      },
    };

    if (serviceStatuses) {
      qry.serviceStatus = { $in: serviceStatuses };
    }

    return models.Buildings.find(qry).lean();
  },
};

export default queries;
