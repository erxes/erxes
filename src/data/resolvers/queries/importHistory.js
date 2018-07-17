import { ImportHistory } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const importHistoryQueries = {
  /**
   * Import history list
   * @param {Object} args - Search params
   * @param {Object} args.type - coc type
   *
   * @return {Promise} filtered histories' list by given parameters
   */
  importHistories(root, { type, ...args }) {
    return paginate(ImportHistory.find({ contentType: type }), args);
  },
};

moduleRequireLogin(importHistoryQueries);

export default importHistoryQueries;
