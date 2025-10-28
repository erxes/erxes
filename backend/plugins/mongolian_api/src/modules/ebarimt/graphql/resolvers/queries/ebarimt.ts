import {
  escapeRegExp,
  getPureDate,
  paginate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolver';
import { getConfig } from '../../../../../utils/utils';

export interface ISearchParams {
  searchValue?: string;
  startDate?: Date;
  endDate?: Date;
  dateType?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  customerId?: string;
  status?: string;
  type?: string;
}

const generateFilter = async (subdomain: string, params: ISearchParams) => {
  const { searchValue, customerId, startDate, endDate, status, type } = params;
  
  // Get config using getConfig like in the old version
  const config = await getConfig(subdomain, "EBARIMT", {});

  const mustFilter = {
    $or: [{ posToken: config.token }, { subToken: config.token }],
  };

  const filter: any = {};

  if (searchValue) {
    filter.$or = [
      { number: { $regex: new RegExp(escapeRegExp(searchValue), 'i') } },
      { registerNo: { $regex: new RegExp(escapeRegExp(searchValue), 'i') } },
    ];
  }

  if (customerId) filter.customerId = customerId;
  if (status) filter.status = status;
  if (type) filter.type = type;

  const dateQry: any = {};
  if (startDate) dateQry.$gte = getPureDate(startDate);
  if (endDate) dateQry.$lte = getPureDate(endDate);
  if (Object.keys(dateQry).length) filter.createdAt = dateQry;

  return { $and: [mustFilter, filter] };
};

const filterEbarimts = async (params: ISearchParams, models, subdomain: string) => {
  const filter = await generateFilter(subdomain, params);
  const { sortField, sortDirection, page, perPage } = params;

  const sort: any = sortField
    ? { [sortField]: sortDirection }
    : { createdAt: sortDirection || -1 };

  return paginate(
    models.Ebarimts.find({ ...filter }).sort(sort).lean(),
    { page, perPage },
  );
};

export const ebarimtQueries = {
  async ebarimts(_root, params: ISearchParams, { models, subdomain }: IContext) {
    return filterEbarimts(params, models, subdomain);
  },

  async fullEbarimts(_root, params: ISearchParams, { models, subdomain }: IContext) {
    return filterEbarimts(params, models, subdomain);
  },

  async ebarimtsTotalCount(_root, params: ISearchParams, { models, subdomain }: IContext) {
    const filter = await generateFilter(subdomain, params);
    return models.PutResponses.find({ ...filter }).countDocuments();
  },

  async ebarimtDetail(_root, { _id }: { _id: string }, { models, subdomain }: IContext) {
    const config = await getConfig(subdomain, "EBARIMT", {});
    return models.PutResponses.findOne({ _id, $or: [{ posToken: config.token }, { subToken: config.token }] }).lean();
  },

  async ebarimtDeliveryInfo(_root, { ebarimtId }, { subdomain }: IContext) {
    const info = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'sales',
      module: 'pos',
      action: 'ebarimtDeliveryInfo',
      input: { ebarimtId },
      defaultValue: {},
    });

    if (info.error) throw new Error(info.error);
    return info;
  },
};

export default ebarimtQueries;