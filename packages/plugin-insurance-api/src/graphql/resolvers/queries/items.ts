// vendorInsuranceItems

import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

const query = (searchField, searchValue) => {
  const qry: any = {};

  if (!searchField) {
    return qry;
  }

  qry[`searchDictionary.${searchField}`] = {
    $regex: searchValue,
    $options: 'i'
  };

  if (
    ['dealCreatedAt', 'dealCloseDate', 'dealStartDate'].includes(searchField)
  ) {
    const dateValue = new Date(searchValue);
    const searchDate = new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate()
    );
    const nextDate = new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate() + 1
    );

    qry[`searchDictionary.${searchField}`] = {
      $gte: searchDate,
      $lt: nextDate
    };
  }

  if (searchField.includes('item')) {
    qry[`searchDictionary.${searchField}`] = searchValue;
  }

  return qry;
};

const queries = {
  insuranceItemList: async (
    _root,
    {
      page,
      perPage,
      sortField,
      sortDirection,
      searchValue,
      searchField
    }: {
      page: number;
      perPage: number;
      sortField: string;
      sortDirection: 'ASC' | 'DESC';
      searchValue: any;
      searchField:
        | 'dealNumber'
        | 'dealCreatedAt'
        | 'dealCloseDate'
        | 'dealStartDate'
        | 'customerRegister'
        | 'customerFirstName'
        | 'customerLastName'
        | 'itemPrice'
        | 'itemFeePercent'
        | 'itemTotalFee';
    },
    { models, subdomain }: IContext
  ) => {
    const qry: any = query(searchField, searchValue);

    let sortOrder = 1;

    if (sortDirection === 'DESC') {
      sortOrder = -1;
    }

    return {
      list: paginate(models.Items.find(qry).sort({ [sortField]: sortOrder }), {
        page,
        perPage
      }),
      totalCount: models.Products.find(qry).count()
    };
  },

  vendorInsuranceItems: async (
    _root,
    {
      page,
      perPage,
      sortField,
      sortDirection,
      searchValue,
      searchField
    }: {
      page: number;
      perPage: number;
      sortField: string;
      sortDirection: 'ASC' | 'DESC';
      searchValue: any;
      searchField:
        | 'dealNumber'
        | 'dealCreatedAt'
        | 'dealCloseDate'
        | 'dealStartDate'
        | 'customerRegister'
        | 'customerFirstName'
        | 'customerLastName'
        | 'itemPrice'
        | 'itemFeePercent'
        | 'itemTotalFee';
    },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const user = await sendCommonMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      serviceName: 'clientportal',
      isRPC: true,
      defaultValue: undefined,
      data: {
        _id: cpUser.userId
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const clientportal = await sendCommonMessage({
      subdomain,
      action: 'clientPortals.findOne',
      serviceName: 'clientportal',
      isRPC: true,
      defaultValue: undefined,
      data: {
        _id: user.clientPortalId
      }
    });

    if (!clientportal) {
      throw new Error("User's clientportal not found");
    }

    if (clientportal.kind !== 'vendor') {
      throw new Error('User is not vendor');
    }

    if (!user.erxesCompanyId) {
      throw new Error('User does not assigned to any company');
    }

    const vendorUsers = await sendCommonMessage({
      subdomain,
      action: 'clientPortalUsers.find',
      serviceName: 'clientportal',
      isRPC: true,
      defaultValue: [],
      data: {
        clientPortalId: user.clientPortalId
      }
    });

    const vendorUserIds = vendorUsers.map((u: any) => u._id);

    const qry: any = query(searchField, searchValue);

    if (vendorUserIds.length > 0) {
      qry.vendorUserId = { $in: vendorUserIds };
    }

    let sortOrder = 1;

    if (sortDirection === 'DESC') {
      sortOrder = -1;
    }

    return {
      list: paginate(models.Items.find(qry).sort({ [sortField]: sortOrder }), {
        page,
        perPage
      }),
      totalCount: models.Items.find(qry).count()
    };
  },

  insuranceItems: async (_root, _args, { models }: IContext) => {
    return models.Items.find({});
  }
};

export default queries;
