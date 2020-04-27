import { EmailTemplates } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const emailTemplateQueries = {
  /**
   * Email templates list
   */
  emailTemplates(_root, _args, { commonQuerySelector }: IContext) {
    return EmailTemplates.find(commonQuerySelector);
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
