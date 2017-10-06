import { EmailTemplates } from '../../../db/models';

export default {
  /**
   * Create new email template
   * @return {Promise} email template object
   */
  emailTemplateAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return EmailTemplates.create({ ...doc });
  },

  /**
   * Update email template
   * @return {Promise} email template object
   */
  async emailTemplateEdit(root, { _id, ...fields }, { user }) {
    if (!user) throw new Error('Login required');

    await EmailTemplates.update({ _id }, { ...fields });
    return EmailTemplates.findOne({ _id });
  },

  /**
   * Delete email template
   * @return {Promise}
   */
  async emailTemplateRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    const emailTemplateObj = await EmailTemplates.findOne({ _id });

    if (!emailTemplateObj) {
      throw new Error(`Email template not found with id ${_id}`);
    }

    return emailTemplateObj.remove();
  },
};
