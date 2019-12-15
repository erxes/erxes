import { ResponseTemplates } from '../../../db/models';
import { IResponseTemplate } from '../../../db/models/definitions/responseTemplates';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IResponseTemplatesEdit extends IResponseTemplate {
  _id: string;
}

const responseTemplateMutations = {
  /**
   * Create new response template
   */
  async responseTemplatesAdd(_root, doc: IResponseTemplate, { user, docModifier }: IContext) {
    const template = await ResponseTemplates.create(docModifier(doc));

    await putCreateLog(
      {
        type: 'responseTemplate',
        newData: JSON.stringify(doc),
        object: template,
        description: `${template.name} has been created`,
      },
      user,
    );

    return template;
  },

  /**
   * Update response template
   */
  async responseTemplatesEdit(_root, { _id, ...fields }: IResponseTemplatesEdit, { user }: IContext) {
    const template = await ResponseTemplates.getResponseTemplate(_id);
    const updated = await ResponseTemplates.updateResponseTemplate(_id, fields);

    await putUpdateLog(
      {
        type: 'responseTemplate',
        object: template,
        newData: JSON.stringify(fields),
        description: `${template.name} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Delete response template
   */
  async responseTemplatesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const template = await ResponseTemplates.getResponseTemplate(_id);
    const removed = await ResponseTemplates.removeResponseTemplate(_id);

    await putDeleteLog(
      {
        type: 'responseTemplate',
        object: template,
        description: `${template.name} has been removed`,
      },
      user,
    );

    return removed;
  },
};

moduleCheckPermission(responseTemplateMutations, 'manageResponseTemplate');

export default responseTemplateMutations;
