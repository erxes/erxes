import { ICustomerDocument } from '@/insurance/@types/customer';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const customerQueries = {
  insuranceGlobalSearchCustomers: Object.assign(
    async (
      _parent: undefined,
      args: ICursorPaginateParams & { searchValue?: string },
      { models }: IContext,
    ) => {
      const searchValue = args.searchValue?.trim();
      const escapedSearchValue = searchValue?.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      const query: FilterQuery<ICustomerDocument> = escapedSearchValue
        ? {
            $or: [
              { firstName: { $regex: escapedSearchValue, $options: 'i' } },
              { lastName: { $regex: escapedSearchValue, $options: 'i' } },
              { companyName: { $regex: escapedSearchValue, $options: 'i' } },
              { email: { $regex: escapedSearchValue, $options: 'i' } },
              { phone: { $regex: escapedSearchValue, $options: 'i' } },
              {
                registrationNumber: {
                  $regex: escapedSearchValue,
                  $options: 'i',
                },
              },
            ],
          }
        : {};

      return cursorPaginate<ICustomerDocument>({
        model: models.Customer,
        params: args,
        query,
      });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  insuranceCustomers: Object.assign(
    async (_parent: undefined, args: any, { models }: IContext) => {
      const { search, page = 1, limit = 100, sort, sortField, filter } = args;
      const query: any = {};

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { registrationNumber: { $regex: search, $options: 'i' } },
        ];
      }

      if (filter) {
        Object.keys(filter).forEach((key) => {
          if (filter[key]) {
            query[key] = filter[key];
          }
        });
      }

      const sortOptions: any = {};
      if (sort && sortField) {
        sortOptions[sortField] = sort === 'DESC' ? -1 : 1;
      }

      const skip = (page - 1) * limit;

      return models.Customer.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  customer: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      return models.Customer.findById(id);
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  customerByRegistration: Object.assign(
    async (
      _parent: undefined,
      { registrationNumber }: { registrationNumber: string },
      { models }: IContext,
    ) => {
      return models.Customer.findOne({ registrationNumber });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  customerByEmail: Object.assign(
    async (
      _parent: undefined,
      { email }: { email: string },
      { models }: IContext,
    ) => {
      return models.Customer.findOne({ email });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  companyByRegistration: Object.assign(
    async (
      _parent: undefined,
      { registrationNumber }: { registrationNumber: string },
      { models }: IContext,
    ) => {
      return models.Customer.findOne({
        registrationNumber,
        type: 'company',
      });
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
