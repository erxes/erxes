import { EmailTemplates } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

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
    return EmailTemplates.find({}).countDocuments();
  },
};

requireLogin(emailTemplateQueries, 'emailTemplatesTotalCount');
checkPermission(emailTemplateQueries, 'emailTemplates', 'showEmailTemplates', []);

export default emailTemplateQueries;
