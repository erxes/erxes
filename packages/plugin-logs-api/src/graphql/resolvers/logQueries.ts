import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { getDbSchemaLabels } from '../../messageBroker';
import { fetchLogs } from '../../utils';

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

export interface IFilter extends ICommonParams {
  createdAt?: any;
  createdBy?: string;
  description?: object;
}

const logQueries = {
  logs(_root, params: ILogQueryParams, { models }: IContext) {
    return fetchLogs(models, params);
  },

  async getDbSchemaLabels(_root, params: { type: string }, { subdomain }: IContext) {
    const [serviceName, moduleName] = params.type.split(':');

    const response = await getDbSchemaLabels(
      serviceName,
      { data: { type: moduleName }, subdomain }
    );

    return response && response.data && Array.isArray(response.data) ? response.data : [];
  },
};

checkPermission(logQueries, 'logs', 'viewLogs');

export default logQueries;
