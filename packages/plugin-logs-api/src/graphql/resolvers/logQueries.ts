import { checkPermission } from '@erxes/api-utils/src/permissions';
import Logs from '../../models/Logs';
import { getDbSchemaLabels } from '../../messageBroker';

interface ICommonParams {
  action?: string | { $in: string[] };
  type?: string | { $in: string[] };
}

interface ILogQueryParams extends ICommonParams {
  start?: string;
  end?: string;
  userId?: string;
  page?: number;
  perPage?: number;
  objectId?: string | { $in: string[] };
  $or: any[];
  desc?: string;
}

interface IFilter extends ICommonParams {
  createdAt?: any;
  createdBy?: string;
  description?: object;
}

const logQueries = {
  async logs(_root, params: ILogQueryParams) {
    const { start, end, userId, action, page, perPage, type, desc } = params;
    const filter: IFilter = {};

    // filter by date
    if (start && end) {
      filter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    } else if (start) {
      filter.createdAt = { $gte: new Date(start) };
    } else if (end) {
      filter.createdAt = { $lte: new Date(end) };
    }

    // filter by user
    if (userId) {
      filter.createdBy = userId;
    }

    // filter by actions
    if (action) {
      filter.action = action;
    }

    // filter by module
    if (type) {
      filter.type = type;
    }

    // filter by description text
    if (desc) {
      filter.description = { $regex: desc, $options: '$i' };
    }

    const _page = Number(page || '1');
    const _limit = Number(perPage || '20');

    const logs = await Logs.find(filter)
      .sort({ createdAt: -1 })
      .limit(_limit)
      .skip((_page - 1) * _limit);

    const logsCount = await Logs.countDocuments(filter);

    return { logs, totalCount: logsCount };
  },
  async getDbSchemaLabels(_root, params: { type: string }) {
    const [serviceName, moduleName] = params.type.split(':');
    const response = await getDbSchemaLabels(serviceName, moduleName);

    return response;
  },
};

checkPermission(logQueries, 'logs', 'viewLogs');

export default logQueries;
