import {
  checkPermission,
  moduleRequireLogin,
} from 'erxes-api-shared/core-modules';
import {
  ICustomerDocument,
  ICustomerQueryFilterParams,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { generateFilter } from '~/modules/contacts/utils';

export const customerQueries = {
  /**
   * Customers list
   */
  async customers(
    _parent: undefined,
    params: ICustomerQueryFilterParams,
    { models }: IContext,
  ) {
    const filter: FilterQuery<ICustomerDocument> = await generateFilter(
      params,
      models,
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
  async customerDetail(
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
      }

      return result;
    }

    return result;
  },
};

moduleRequireLogin(customerQueries);
checkPermission(customerQueries, 'customers', 'showCustomers');
