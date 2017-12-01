import { EmailTemplates } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const emailTemplateMutations = {
  /**
   * Create new email template
   * @param {Object} doc - email templates fields
   * @return {Promise} newly created email template object
   */
  emailTemplatesAdd(root, doc) {
    return EmailTemplates.create(doc);
  },

  /**
   * Update email template
   * @param {String} _id - email templates id
   * @param {Object} fields - email templates fields
   * @return {Promise} updated email template object
   */
  emailTemplatesEdit(root, { _id, ...fields }) {
    return EmailTemplates.updateEmailTemplate(_id, fields);
  },

  /**
   * Delete email template
   * @param {String} doc - email templates fields
   * @return {Promise}
   */
  emailTemplatesRemove(root, { _id }) {
    return EmailTemplates.removeEmailTemplate(_id);
  },
};

moduleRequireLogin(emailTemplateMutations);

export default emailTemplateMutations;
