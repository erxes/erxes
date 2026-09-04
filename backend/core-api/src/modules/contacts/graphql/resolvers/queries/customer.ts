import {
  ICustomerDocument,
  ICustomerQueryFilterParams,
  Resolver,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { customersCount, generateFilter } from '~/modules/contacts/utils';
import { customerSearchTokenConfig } from '@/contacts/db/definitions/customers';

const logCustomersMemory = (
  stage: string,
  startedAt: number,
  details: Record<string, boolean | number | string | undefined> = {},
) => {
  const memory = process.memoryUsage();

  console.info('[customers-memory]', {
    stage,
    elapsedMs: Math.round(performance.now() - startedAt),
    rssMb: Math.round(memory.rss / 1024 / 1024),
    heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
    externalMb: Math.round(memory.external / 1024 / 1024),
    arrayBuffersMb: Math.round(memory.arrayBuffers / 1024 / 1024),
    ...details,
  });
};

export const customerQueries: Record<
  string,
  Resolver<undefined, unknown, IContext>
> = {
  /**
   * Customers list
   */
  async customers(
    _parent: undefined,
    params: ICustomerQueryFilterParams,
    { models, subdomain }: IContext,
  ) {
    const startedAt = performance.now();
    const searchValue = params.searchValue?.trim();

    logCustomersMemory('start', startedAt, {
      hasSearchValue: Boolean(searchValue),
      searchValueLength: searchValue?.length ?? 0,
      limit: params.limit,
      hasCursor: Boolean(params.cursor),
    });

    try {
      const filter: FilterQuery<ICustomerDocument> = await generateFilter(
        subdomain,
        params,
        models,
        customerSearchTokenConfig,
      );

      logCustomersMemory('filter-generated', startedAt);

      const { list, totalCount, pageInfo } =
        await cursorPaginate<ICustomerDocument>({
          model: models.Customers,
          params,
          query: filter,
        });

      logCustomersMemory('pagination-complete', startedAt, {
        listLength: list.length,
        totalCount,
      });

      return { list, totalCount, pageInfo };
    } catch (error) {
      logCustomersMemory('error', startedAt, {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });

      throw error;
    }
  },

  async cpCustomers(
    _parent: undefined,
    params: ICustomerQueryFilterParams,
    { models, subdomain }: IContext,
  ) {
    const filter: FilterQuery<ICustomerDocument> = await generateFilter(
      subdomain,
      params,
      models,
      customerSearchTokenConfig,
    );

    const { list, totalCount, pageInfo } =
      await cursorPaginate<ICustomerDocument>({
        model: models.Customers,
        params,
        query: filter,
      });

    return { list, totalCount, pageInfo };
  },

  /**
   * Get one customer
   */
  customerDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Customers.getCustomer(_id);
  },

  cpCustomerDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Customers.getCustomer(_id);
  },

  async contactsLogs(
    _parent: undefined,
    args: { action: string; contentType: string; content: string[] },
    { models }: IContext,
  ) {
    const { Companies, Customers } = models;
    const { action, contentType, content } = args;
    let result = {};

    const type = contentType.split(':')[1];

    if (action === 'merge') {
      switch (type) {
        case 'company':
          result = await Companies.find({
            _id: { $in: content },
          }).lean();
          break;
        case 'customer':
          result = await Customers.find({
            _id: { $in: content },
          }).lean();
          break;
        default:
          break;
      }

      return result;
    }

    return result;
  },

  async customersCount(
    _parent: undefined,
    params: { types?: string[] },
    { models, subdomain }: IContext,
  ) {
    const types = params.types || [];

    const counts = {};

    for (const type of types) {
      const contentType = type.toLowerCase();

      counts[contentType] = await customersCount({
        models,
        subdomain,
        type: contentType,
      });
    }

    return counts;
  },
};

customerQueries.cpCustomers.wrapperConfig = {
  forClientPortal: true,
};

customerQueries.cpCustomerDetail.wrapperConfig = {
  forClientPortal: true,
};
