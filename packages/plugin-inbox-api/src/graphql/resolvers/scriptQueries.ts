import { checkPermission, paginate, requireLogin } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const scriptQueries = {
  /**
   * Scripts list
   */
  scripts(
    _root,
    args: { page: number; perPage: number },
    { commonQuerySelector, models }: IContext
  ) {
    return paginate(models.Scripts.find(commonQuerySelector), args);
  },

  /**
   * Get all scripts count. We will use it in pager
   */
  scriptsTotalCount(_root, _args, { commonQuerySelector, models }: IContext) {
    return models.Scripts.find(commonQuerySelector).countDocuments();
  }
};

requireLogin(scriptQueries, 'scriptsTotalCount');

checkPermission(scriptQueries, 'scripts', 'showScripts', []);

export default scriptQueries;
