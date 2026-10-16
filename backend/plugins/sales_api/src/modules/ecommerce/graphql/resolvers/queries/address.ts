import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import type { FilterQuery } from 'mongoose';
import type { IAddressDocument } from '@/ecommerce/@types/address';
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

const generateFilter = (params: IListParams): FilterQuery<IAddressDocument> => {
  const { searchValue, customerId, aliasType, city, district, street } = params;

  const filter: FilterQuery<IAddressDocument> = {};

  if (searchValue) {
    filter.$or = [
      { address1: { $regex: escapeRegExp(searchValue), $options: 'i' } },
      { address2: { $regex: escapeRegExp(searchValue), $options: 'i' } },
      { city: { $regex: escapeRegExp(searchValue), $options: 'i' } },
      { district: { $regex: escapeRegExp(searchValue), $options: 'i' } },
      { street: { $regex: escapeRegExp(searchValue), $options: 'i' } },
      { phone: { $regex: escapeRegExp(searchValue), $options: 'i' } },
    ];
  }

  if (customerId) filter.customerId = customerId;
  if (aliasType) filter.alias = aliasType;
  if (city) filter.city = city;
  if (district) filter.district = district;
  if (street) filter.street = street;

  return filter;
};

export const addressQueries: Record<string, Resolver> = {
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

addressQueries.addressList.wrapperConfig = { forClientPortal: true }

export default addressQueries;
