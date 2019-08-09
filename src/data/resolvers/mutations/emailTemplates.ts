import { EmailTemplates } from '../../../db/models';
import { IEmailTemplate } from '../../../db/models/definitions/emailTemplates';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IEmailTemplatesEdit extends IEmailTemplate {
  _id: string;
}

const emailTemplateMutations = {
  /**
   * Create new email template
   */
  async emailTemplatesAdd(_root, doc: IEmailTemplate, { user, docModifier }: IContext) {
    const template = await EmailTemplates.create(docModifier(doc));

    if (template) {
      await putCreateLog(
        {
          type: 'emailTemplate',
          newData: JSON.stringify(doc),
          object: template,
          description: `${template.name} has been created`,
        },
        user,
      );
    }

    return template;
  },

  /**
   * Update email template
   */
  async emailTemplatesEdit(_root, { _id, ...fields }: IEmailTemplatesEdit, { user, docModifier }: IContext) {
    const template = await EmailTemplates.findOne({ _id });
    const updated = await EmailTemplates.updateEmailTemplate(_id, docModifier(fields));

    if (template) {
      await putUpdateLog(
        {
          type: 'emailTemplate',
          object: template,
          newData: JSON.stringify(fields),
          description: `${template.name} has been edited`,
        },
        user,
      );
    }

    return updated;
  },

  /**
   * Delete email template
   */
  async emailTemplatesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const template = await EmailTemplates.findOne({ _id });
    const removed = await EmailTemplates.removeEmailTemplate(_id);

    if (template) {
      await putDeleteLog(
        {
          type: 'emailTemplate',
          object: template,
          description: `${template.name} has been removed`,
        },
        user,
      );
    }

    return removed;
  },
};

moduleCheckPermission(emailTemplateMutations, 'manageEmailTemplate');

export default emailTemplateMutations;
