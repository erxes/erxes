import { ImportHistory } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const importHistoryQueries = {
  /**
   * Import history list
   */
  importHistories(_root, { type, ...args }: { page: number; perPage: number; type: string }) {
    return paginate(ImportHistory.find({ contentType: type }), args);
  },
};

moduleRequireLogin(importHistoryQueries);

export default importHistoryQueries;
