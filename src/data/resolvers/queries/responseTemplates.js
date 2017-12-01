import { ResponseTemplates } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const responseTemplateQueries = {
  /**
   * Response templates list
   * @param {Object} args - Search params
   * @return {Promise} response template objects
   */
  responseTemplates(root, args) {
    return paginate(ResponseTemplates.find({}), args);
  },

  /**
   * Get all response templates count. We will use it in pager
   * @return {Promise} total count
   */
  responseTemplatesTotalCount() {
    return ResponseTemplates.find({}).count();
  },
};

moduleRequireLogin(responseTemplateQueries);

export default responseTemplateQueries;
