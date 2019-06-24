import { ResponseTemplates } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

const responseTemplateQueries = {
  /**
   * Response templates list
   */
  responseTemplates(_root, args: { page: number; perPage: number }) {
    return paginate(ResponseTemplates.find({}), args);
  },

  /**
   * Get all response templates count. We will use it in pager
   */
  responseTemplatesTotalCount() {
    return ResponseTemplates.find({}).countDocuments();
  },
};

requireLogin(responseTemplateQueries, 'responseTemplatesTotalCount');
checkPermission(responseTemplateQueries, 'responseTemplates', 'showResponseTemplates', []);

export default responseTemplateQueries;
