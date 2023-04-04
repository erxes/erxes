import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import { ServiceStatus } from '../../../models/definitions/buildings';

const buildQuery = (params: any) => {
  const {
    searchValue,
    cityId,
    districtId,
    quarterId,
    customQuery,
    netWorkType
  } = params;
  const filter: any = {};

  if (searchValue) {
    filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
  }

  if (cityId) {
    filter.cityId = cityId;
  }

  if (districtId) {
    filter.districtId = districtId;
  }

  if (quarterId) {
    filter.quarterId = quarterId;
  }

  if (netWorkType) {
    filter.netWorkType = netWorkType;
  }

  return { ...filter, ...customQuery };
};

const queries = {
  buildingList: async (_root, params, { models }: IContext) => {
    const filter: any = buildQuery(params);
    const { page, perPage } = params;

    return {
      list: paginate(
        models.Buildings.find(filter)
          .sort({ updatedAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      ),
      totalCount: models.Buildings.find(filter).count()
    };
  },

  buildings: async (_root, params, { models }: IContext) => {
    const filter: any = buildQuery(params);
    const { page, perPage } = params;

    return paginate(models.Buildings.find(filter).lean(), {
      page: page || 1,
      perPage: perPage || 20
    });
  },

  buildingDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Buildings.getBuilding({ _id });
  },

  buildingGet: async (
    _root,
    { osmbId }: { osmbId: string },
    { models }: IContext
  ) => {
    return models.Buildings.getBuilding({ osmbId });
  },

  buildingsByBounds: async (
    _root,
    {
      bounds,
      serviceStatuses
    }: { bounds: any; serviceStatuses: [ServiceStatus] },
    { models }: IContext
  ) => {
    const qry: any = {
      location: {
        $geoWithin: { $polygon: bounds }
      }
    };

    if (serviceStatuses) {
      qry.serviceStatus = { $in: serviceStatuses };
    }

    return models.Buildings.find(qry).lean();
  }
};

export default queries;
