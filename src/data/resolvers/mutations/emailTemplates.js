import { EmailTemplates } from '../../../db/models';

export default {
  /**
   * Create new email template
   * @param {Object} doc - email templates fields
   * @return {Promise} newly created email template object
   */
  emailTemplatesAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return EmailTemplates.create(doc);
  },

  /**
   * Update email template
   * @param {String} _id - email templates id
   * @param {Object} fields - email templates fields
   * @return {Promise} updated email template object
   */
  emailTemplatesEdit(root, { _id, ...fields }, { user }) {
    if (!user) throw new Error('Login required');

    return EmailTemplates.updateEmailTemplate(_id, fields);
  },

  /**
   * Delete email template
   * @param {String} doc - email templates fields
   * @return {Promise}
   */
  emailTemplatesRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    return EmailTemplates.removeEmailTemplate(_id);
  },
};
