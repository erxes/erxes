import { EmailTemplates } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const emailTemplateQueries = {
  /**
   * Email templates list
   */
  emailTemplates(_root, args: { page: number; perPage: number }) {
    return paginate(EmailTemplates.find({}), args);
  },

  /**
   * Get all email templates count. We will use it in pager
   */
  emailTemplatesTotalCount() {
    return EmailTemplates.find({}).count();
  },
};

moduleRequireLogin(emailTemplateQueries);

export default emailTemplateQueries;
