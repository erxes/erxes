import { EmailTemplates } from '../../../db/models';
import { IEmailTemplate } from '../../../db/models/definitions/emailTemplates';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IEmailTemplatesEdit extends IEmailTemplate {
  _id: string;
}

const emailTemplateMutations = {
  /**
   * Creates a new email template
   */
  async emailTemplatesAdd(_root, doc: IEmailTemplate, { user, docModifier }: IContext) {
    const template = await EmailTemplates.create(docModifier(doc));

    await putCreateLog(
      {
        type: MODULE_NAMES.EMAIL_TEMPLATE,
        newData: doc,
        object: template,
      },
      user,
    );

    return template;
  },

  /**
   * Update email template
   */
  async emailTemplatesEdit(_root, { _id, ...fields }: IEmailTemplatesEdit, { user }: IContext) {
    const template = await EmailTemplates.getEmailTemplate(_id);
    const updated = await EmailTemplates.updateEmailTemplate(_id, fields);

    await putUpdateLog(
      {
        type: MODULE_NAMES.EMAIL_TEMPLATE,
        object: template,
        newData: fields,
      },
      user,
    );

    return updated;
  },

  /**
   * Delete email template
   */
  async emailTemplatesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const template = await EmailTemplates.getEmailTemplate(_id);
    const removed = await EmailTemplates.removeEmailTemplate(_id);

    await putDeleteLog({ type: MODULE_NAMES.EMAIL_TEMPLATE, object: template }, user);

    return removed;
  },
};

moduleCheckPermission(emailTemplateMutations, 'manageEmailTemplate');

export default emailTemplateMutations;
