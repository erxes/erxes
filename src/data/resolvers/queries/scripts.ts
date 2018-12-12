import { Scripts } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const scriptQueries = {
  /**
   * Scripts list
   */
  scripts(_root, args: { page: number; perPage: number }) {
    return paginate(Scripts.find({}), args);
  },

  /**
   * Get all scripts count. We will use it in pager
   */
  scriptsTotalCount() {
    return Scripts.find({}).countDocuments();
  },
};

moduleRequireLogin(scriptQueries);

export default scriptQueries;
