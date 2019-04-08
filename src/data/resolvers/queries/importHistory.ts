import { ImportHistory } from '../../../db/models';
import { checkPermission } from '../../permissions';
import { paginate } from './utils';

const importHistoryQueries = {
  /**
   * Import history list
   */
  importHistories(_root, { type, ...args }: { page: number; perPage: number; type: string }) {
    return paginate(ImportHistory.find({ contentType: type }), args);
  },
};

checkPermission(importHistoryQueries, 'importHistories', 'importHistories', []);

export default importHistoryQueries;
