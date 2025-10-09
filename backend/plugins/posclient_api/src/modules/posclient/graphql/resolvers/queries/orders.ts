import {
  escapeRegExp,
  getPureDate,
  paginate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IConfig } from '~/modules/posclient/@types/configs';
import { IContext } from '~/modules/posclient/@types/types';
import { getCompanyInfo } from '~/modules/posclient/db/models/PutData';

export interface ISearchParams {
  searchValue?: string;
  startDate?: Date;
  endDate?: Date;
  dateType: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  customerId?: string;
  customerType?: string;
  isPaid?: boolean;
  statuses?: string[];
  types: string[];
  saleStatus: string;
  dueStartDate?: Date;
  dueEndDate?: Date;
  isPreExclude?: boolean;
  slotCode?: string;
}

const generateFilter = (config: IConfig, params: ISearchParams) => {
  const {
    searchValue,
    statuses,
    types,
    saleStatus,
    customerId,
    startDate,
    endDate,
    isPaid,
    dateType,
    customerType,
    dueStartDate,
    dueEndDate,
    isPreExclude,
    slotCode,
  } = params;

  const mustFilter: any = {
    $or: [{ posToken: config.token }, { subToken: config.token }],
  };

  const filter: any = {};
  if (searchValue) {
    filter.$or = [
      { number: { $regex: new RegExp(escapeRegExp(searchValue), 'i') } },
      { origin: { $regex: new RegExp(escapeRegExp(searchValue), 'i') } },
    ];
  }

  if (customerId) {
    filter.customerId = customerId;
  }

  if (slotCode) {
    filter.slotCode = slotCode;
  }

  if (saleStatus) {
    filter.saleStatus = saleStatus;
  }

  if (types?.length) {
    filter.type = { $in: types };
  }

  if (statuses?.length) {
    filter.status = { $in: statuses };
  }

  if (customerType) {
    filter.customerType =
      customerType === 'customer'
        ? { $in: [customerType, '', undefined, null] }
        : customerType;
  }

  if (isPaid !== undefined) {
    filter.paidDate = { $exists: isPaid };
  }

  if (isPreExclude) {
    filter.isPre = { $ne: true };
  }

  const dateQry: any = {};
  if (startDate) {
    dateQry.$gte = getPureDate(startDate);
  }

  if (endDate) {
    dateQry.$lte = getPureDate(endDate);
  }

  if (Object.keys(dateQry).length) {
    const dateTypes = {
      paid: 'paidDate',
      created: 'createdAt',
      default: 'modifiedAt',
    };
    filter[dateTypes[dateType || 'default']] = dateQry;
  }

  const dueDateQry: any = {};
  if (dueStartDate) {
    dueDateQry.$gte = getPureDate(dueStartDate);
  }
  if (dueEndDate) {
    dueDateQry.$lte = getPureDate(dueEndDate);
  }
  if (Object.keys(dueDateQry).length) {
    filter.dueDate = dueDateQry;
  }

  return { $and: [{ ...mustFilter }, { ...filter }] };
};

const filterOrders = (params: ISearchParams, models, config) => {
  const filter = generateFilter(config, params);
  const { sortField, sortDirection, page, perPage } = params;
  const sort: { [key: string]: any } = {};

  if (sortField) {
    sort[sortField] = sortDirection;
  } else {
    sort.createdAt = sortDirection || 1;
  }

  return paginate(
    models.Orders.find({
      ...filter,
    })
      .sort(sort)
      .lean(),
    { page, perPage },
  );
};

const orderQueries = {
  async orders(_root, params: ISearchParams, { models, config }: IContext) {
    return filterOrders(params, models, config);
  },

  async fullOrders(_root, params: ISearchParams, { models, config }: IContext) {
    return filterOrders(params, models, config);
  },

  async ordersTotalCount(
    _root,
    params: ISearchParams,
    { models, config }: IContext,
  ) {
    const filter = generateFilter(config, params);
    return await models.Orders.find({
      ...filter,
    }).countDocuments();
  },

  async fullOrderItems(
    _root,
    {
      searchValue,
      statuses,
      page,
      perPage,
      sortField,
      sortDirection,
    }: ISearchParams,
    { models }: IContext,
  ) {
    const filter: any = {};

    if (searchValue) {
      filter.number = { $regex: new RegExp(escapeRegExp(searchValue), 'i') };
    }
    const sort: { [key: string]: any } = {};

    if (sortField) {
      sort[sortField] = sortDirection;
    } else {
      sort.createdAt = 1;
    }

    return paginate(
      models.OrderItems.find({
        ...filter,
        status: { $in: statuses },
      })
        .sort(sort)
        .lean(),
      { page, perPage },
    );
  },

  async orderDetail(
    _root,
    { _id, customerId }: { _id: string; customerId?: string },
    { posUser, models, config }: IContext,
  ) {
    const tokenFilter = {
      $or: [{ posToken: config.token }, { subToken: config.token }],
    };
    if (posUser) {
      return models.Orders.findOne({ _id, ...tokenFilter });
    }

    const order = await models.Orders.findOne({ _id, ...tokenFilter }).lean();

    if (
      !order ||
      !(order.customerType === 'visitor' || order.customerId === customerId)
    ) {
      throw new Error('Not found');
    }

    return order;
  },

  async ordersCheckCompany(_root, { registerNumber }, { config }: IContext) {
    const checkTaxpayerUrl = config.ebarimtConfig?.checkTaxpayerUrl;

    if (!checkTaxpayerUrl) {
      throw new Error('Not found check taxpayer url');
    }
    const resp = await getCompanyInfo({ checkTaxpayerUrl, no: registerNumber });

    if (resp.status !== 'checked' || !resp.tin) {
      throw new Error('Company register number required for checking');
    }

    return resp.result?.data;
  },

  async ordersDeliveryInfo(_root, { orderId }, { subdomain }: IContext) {
    // const info = await sendPosMessage({
    //   subdomain,
    //   action: 'ordersDeliveryInfo',
    //   data: {
    //     orderId: orderId,
    //   },
    //   isRPC: true,
    // });
    const info = await sendTRPCMessage({
      method: 'query',
      pluginName: 'sales',
      module: 'pos',
      action: 'ordersDeliveryInfo',
      input: { orderId: orderId },
      defaultValue: {},
    });
    if (info.error) {
      throw new Error(info.error);
    }

    return info;
  },
};

export default orderQueries;
