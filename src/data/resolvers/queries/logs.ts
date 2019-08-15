import { checkPermission } from '../../permissions/wrappers';
import { fetchLogs, ILogQueryParams } from '../../utils';

const logQueries = {
  /**
   * Fetches logs from logs api server
   * @param {string} params.start Start date
   * @param {string} params.end End date
   * @param {string} params.userId User
   * @param {string} params.action Action (one of create|update|delete)
   * @param {string} params.page
   * @param {string} params.perPage
   */
  logs(_root, params: ILogQueryParams) {
    const { start, end, userId, action, page, perPage } = params;

    return fetchLogs({
      start,
      end,
      userId,
      action,
      page,
      perPage,
    });
  },
};

checkPermission(logQueries, 'logs', 'viewLogs');

export default logQueries;
