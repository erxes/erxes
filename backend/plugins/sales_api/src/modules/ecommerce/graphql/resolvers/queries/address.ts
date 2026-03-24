import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export interface IListParams {
  page: number;
  perPage: number;
  searchValue: string;
  aliasType: string;
  customerId: string;
  city: string;
  district: string;
  street: string;
}

const generateFilter = (params: IListParams) => {
  const { searchValue, customerId, aliasType, city, district, street } = params;

  const filter: any = {};

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (searchValue) {
    const escaped = escapeRegExp(searchValue);

    filter.$or = [
      { address1: { $regex: new RegExp(escaped, 'i') } },
      { address2: { $regex: new RegExp(escaped, 'i') } },
      { city: { $regex: new RegExp(escaped, 'i') } },
      { district: { $regex: new RegExp(escaped, 'i') } },
      { street: { $regex: new RegExp(escaped, 'i') } },
      { phone: { $regex: new RegExp(escaped, 'i') } },
    ];
  }

  if (customerId) filter.customerId = customerId;
  if (aliasType) filter.alias = aliasType;
  if (city) filter.city = city;
  if (district) filter.district = district;
  if (street) filter.street = street;

  return filter;
};

export const addressQueries = {
  address: async (_root, params: { _id: string }, { models }: IContext) => {
    const { _id } = params;

    const address = await models.Address.getAddressById(_id);

    return address;
  },

  addressList: async (_root, params: IListParams, { models }: IContext) => {
    const filter = generateFilter(params);

    const list = await cursorPaginate({
      model: models.Address,
      params: {
        ...params,
        orderBy: { createdAt: -1 },
      },
      query: filter,
    });

    return list.list;
  },
};

export default addressQueries;
