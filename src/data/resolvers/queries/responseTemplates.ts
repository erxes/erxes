import { ResponseTemplates } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

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
    return ResponseTemplates.find({}).count();
  },
};

moduleRequireLogin(responseTemplateQueries);

export default responseTemplateQueries;
