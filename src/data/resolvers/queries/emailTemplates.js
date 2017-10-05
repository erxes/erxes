import { EmailTemplates } from '../../../db/models';

export default {
  /**
   * Email templates list
   * @param {Object} args
   * @param {Integer} args.limit
   * @return {Promise} email template objects
   */
  emailTemplates(root, { limit }) {
    const emailTemplates = EmailTemplates.find({});

    if (limit) {
      return emailTemplates.limit(limit);
    }

    return emailTemplates;
  },

  /**
   * Get all email templates count. We will use it in pager
   * @return {Promise} total count
   */
  emailTemplatesTotalCount() {
    return EmailTemplates.find({}).count();
  },
};
