import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

interface IListParams {
  page: number;
  perPage: number;
  searchValue: string;
  aliasType: string;
  customerId: string;
  city: string;
  district: string;
  street: string;
}

const generateFilter = async (params: IListParams) => {
  const { searchValue, customerId, aliasType, city, district, street } = params;

  let filter: any = {};

  if (searchValue) {
    filter.$or = [
      { address1: { $regex: new RegExp(searchValue) } },
      { address2: { $regex: new RegExp(searchValue) } },
      { city: { $regex: new RegExp(searchValue) } },
      { district: { $regex: new RegExp(searchValue) } },
      { street: { $regex: new RegExp(searchValue) } },
      { phone: { $regex: new RegExp(searchValue) } },
    ];
  }

  if (customerId) {
    filter.customerId = customerId;
  }

  if (aliasType) {
    filter.alias = aliasType;
  }

  if (city) {
    filter.city = city;
  }

  if (district) {
    filter.alias = district;
  }

  if (street) {
    filter.alias = street;
  }

  return filter;
};

const addressQueries = {
  address: async (_root, params: { _id: string }, { models }: IContext) => {
    const { _id } = params;

    const address = await models.Address.getAddressById(_id);

    return address;
  },

  addressList: async (_root, params: IListParams, { models }: IContext) => {
    const filter = await generateFilter(params);

    const list = await paginate(
      models.Address.find(filter).sort({ createdAt: -1 }),
      params,
    );

    return list;
  },
};

export default addressQueries;
