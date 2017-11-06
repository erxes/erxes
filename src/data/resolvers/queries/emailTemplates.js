import { EmailTemplates } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const emailTemplateQueries = {
  /**
   * Email templates list
   * @param {Object} args - Search params
   * @return {Promise} email template objects
   */
  emailTemplates(root, { params = {} }) {
    return paginate(EmailTemplates.find({}), params);
  },

  /**
   * Get all email templates count. We will use it in pager
   * @return {Promise} total count
   */
  emailTemplatesTotalCount() {
    return EmailTemplates.find({}).count();
  },
};

moduleRequireLogin(emailTemplateQueries);

export default emailTemplateQueries;
