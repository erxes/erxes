import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import { ServiceStatus } from '../../../models/definitions/buildings';

const queries = {
  buildingList: async (
    _root,
    {
      searchValue,
      cityId,
      districtId,
      quarterId,
      page,
      perPage
    }: {
      searchValue?: string;
      page?: number;
      perPage?: number;
      cityId?: string;
      districtId?: string;
      quarterId?: string;
    },
    { models }: IContext
  ) => {
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

  buildings: async (
    _root,
    {
      searchValue,
      cityId,
      districtId,
      quarterId,
      page,
      perPage
    }: {
      searchValue?: string;
      page?: number;
      perPage?: number;
      cityId?: string;
      districtId?: string;
      quarterId?: string;
    },
    { models }: IContext
  ) => {
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
    return models.Buildings.getBuilding(_id);
  },

  buildingsByBounds: async (
    _root,
    {
      bounds,
      serviceStatuses
    }: { bounds: any; serviceStatuses: [ServiceStatus] },
    { models }: IContext
  ) => {
    console.log(bounds);

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
