import mongoose from 'mongoose';
import Random from 'meteor-random';

const EmailTemplateSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  content: String,
});

class EmailTemplate {
  /**
   * Update email template
   * @param  {String} _id - email template id
   * @param  {Object} fields - email template fields
   * @return {Promise} Update email template object
   */
  static async updateEmailTemplate(_id, fields) {
    await EmailTemplates.update({ _id }, { $set: fields });
    return EmailTemplates.findOne({ _id });
  }

  /**
   * Delete email template
   * @param  {String} _id - email template id
   * @return {Promise}
   */
  static async removeEmailTemplate(_id) {
    const emailTemplateObj = await EmailTemplates.findOne({ _id });

    if (!emailTemplateObj) {
      throw new Error(`Email template not found with id ${_id}`);
    }

    return emailTemplateObj.remove();
  }
}

EmailTemplateSchema.loadClass(EmailTemplate);
const EmailTemplates = mongoose.model('email_templates', EmailTemplateSchema);

export default EmailTemplates;
