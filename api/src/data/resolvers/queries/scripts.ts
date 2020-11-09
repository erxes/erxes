import { Scripts } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

const scriptQueries = {
  /**
   * Scripts list
   */
  scripts(
    _root,
    args: { page: number; perPage: number },
    { commonQuerySelector }: IContext
  ) {
    return paginate(Scripts.find(commonQuerySelector), args);
  },

  /**
   * Get all scripts count. We will use it in pager
   */
  scriptsTotalCount(_root, _args, { commonQuerySelector }: IContext) {
    return Scripts.find(commonQuerySelector).countDocuments();
  }
};

requireLogin(scriptQueries, 'scriptsTotalCount');

checkPermission(scriptQueries, 'scripts', 'showScripts', []);

export default scriptQueries;
