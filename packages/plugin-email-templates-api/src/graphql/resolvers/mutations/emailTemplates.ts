import { IEmailTemplate } from '../../../models/definitions/emailTemplates';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../../logUtils';
import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const EMAIL_TEMPLATE = 'emailTemplate';

interface IEmailTemplatesEdit extends IEmailTemplate {
  _id: string;
}

const emailTemplateMutations = {
  /**
   * Creates a new email template
   */
  async emailTemplatesAdd(
    _root,
    doc: IEmailTemplate,
    { user, docModifier, models }: IContext
  ) {
    const template = await models.EmailTemplates.create(docModifier(doc));

    await putCreateLog(
      {
        type: EMAIL_TEMPLATE,
        newData: doc,
        object: template
      },
      user
    );

    return template;
  },

  /**
   * Update email template
   */
  async emailTemplatesEdit(
    _root,
    { _id, ...fields }: IEmailTemplatesEdit,
    { models, user }: IContext
  ) {
    const template = await models.EmailTemplates.getEmailTemplate(_id);
    const updated = await models.EmailTemplates.updateEmailTemplate(_id, fields);

    await putUpdateLog(
      {
        type: EMAIL_TEMPLATE,
        object: template,
        newData: fields
      },
      user
    );

    return updated;
  },

  /**
   * Changes the status
   * @param {string} param2._id EmailTemplate id
   * @param {string} param2.status EmailTemplate status
   */
  async emailTemplatesChangeStatus(
    _root,
    { _id, status }: IEmailTemplatesEdit,
    { models, user }: IContext
  ) {
    const emailTemplate = await models.EmailTemplates.getEmailTemplate(_id);

    await models.EmailTemplates.updateOne({ _id }, { $set: { status } });

    const updated = await models.EmailTemplates.findOne({ _id });

    await putUpdateLog(
      {
        type: EMAIL_TEMPLATE,
        object: emailTemplate,
        newData: { status },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },
  /**
   * Delete email template
   */
  async emailTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { models, user }: IContext
  ) {
    const template = await models.EmailTemplates.getEmailTemplate(_id);
    const removed = await models.EmailTemplates.removeEmailTemplate(_id);

    await putDeleteLog(
      { type: EMAIL_TEMPLATE, object: template },
      user
    );

    return removed;
  }
};

moduleCheckPermission(emailTemplateMutations, 'manageEmailTemplate');

export default emailTemplateMutations;
