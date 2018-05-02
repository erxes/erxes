import { ImportHistory } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const importHistoryQueries = {
  /**
   * Channels list
   * @param {Object} args - Search params
   * @return {Promise} filtered channels list by given parameters
   */
  importHistories(root, { queryParams }) {
    return paginate(ImportHistory.find({}), queryParams);
  },
};

moduleRequireLogin(importHistoryQueries);

export default importHistoryQueries;
