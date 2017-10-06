import { EmailTemplates } from '../../../db/models';

export default {
  /**
   * Create new email template
   * @return {Promise} email template object
   */
  emailTemplateAdd(root, { name, content }, { user }) {
    if (!user) throw new Error('Login required');

    return EmailTemplates.create({ name, content });
  },

  /**
   * Update email template
   * @return {Promise} email template object
   */
  async emailTemplateEdit(root, { _id, name, content }, { user }) {
    if (!user) throw new Error('Login required');

    await EmailTemplates.update({ _id }, { name, content });
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
      throw new Error('Email template not found with id ' + _id);
    }

    return emailTemplateObj.remove();
  },
};
