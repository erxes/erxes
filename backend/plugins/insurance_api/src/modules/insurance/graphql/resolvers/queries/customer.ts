import { IContext } from '~/connectionResolvers';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery, SortOrder } from 'mongoose';
import { ICustomerDocument } from '@/insurance/@types/customer';

type TCustomerQueryArgs = {
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'ASC' | 'DESC';
  sortField?: string;
  filter?: Record<string, unknown>;
  orderBy?: { createdAt?: 1 | -1 };
};

export const customerQueries = {
  insuranceCustomers: Object.assign(
    async (
      _parent: undefined,
      args: TCustomerQueryArgs,
      { models }: IContext,
    ) => {
      const {
        search,
        page = 1,
        limit = 100,
        sort,
        sortField,
        filter,
        orderBy,
      } = args;
      const query: FilterQuery<ICustomerDocument> = {};

      if (search) {
        const escapedSearch = escapeRegExp(search);
        query.$or = [
          { firstName: { $regex: escapedSearch, $options: 'i' } },
          { lastName: { $regex: escapedSearch, $options: 'i' } },
          { email: { $regex: escapedSearch, $options: 'i' } },
          { registrationNumber: { $regex: escapedSearch, $options: 'i' } },
        ];
      }

      if (filter) {
        Object.keys(filter).forEach((key) => {
          if (filter[key]) {
            query[key] = filter[key];
          }
        });
      }

      const sortOptions: Record<string, SortOrder> = {};
      if (orderBy?.createdAt === 1 || orderBy?.createdAt === -1) {
        sortOptions.createdAt = orderBy.createdAt;
      } else if (sort && sortField) {
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
