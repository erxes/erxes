import { IResponseTemplate } from '../../models/definitions/responseTemplates';

import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';

import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

interface IResponseTemplatesEdit extends IResponseTemplate {
  _id: string;
}

const responseTemplateMutations = {
  /**
   * Creates a new response template
   */
  async responseTemplatesAdd(
    _root,
    doc: IResponseTemplate,
    { user, docModifier, models }: IContext
  ) {
    const template = await models.ResponseTemplates.create(docModifier(doc));

    await putCreateLog(
      {
        type: MODULE_NAMES.RESPONSE_TEMPLATE,
        newData: doc,
        object: template
      },
      user
    );

    return template;
  },

  /**
   * Updates a response template
   */
  async responseTemplatesEdit(
    _root,
    { _id, ...fields }: IResponseTemplatesEdit,
    { user, models }: IContext
  ) {
    const template = await models.ResponseTemplates.getResponseTemplate(_id);
    const updated = await models.ResponseTemplates.updateResponseTemplate(_id, fields);

    await putUpdateLog(
      {
        type: MODULE_NAMES.RESPONSE_TEMPLATE,
        object: template,
        newData: fields,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Deletes a response template
   */
  async responseTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext
  ) {
    const template = await models.ResponseTemplates.getResponseTemplate(_id);
    const removed = await models.ResponseTemplates.removeResponseTemplate(_id);

    await putDeleteLog(
      { type: MODULE_NAMES.RESPONSE_TEMPLATE, object: template },
      user
    );

    return removed;
  }
};

moduleCheckPermission(responseTemplateMutations, 'manageResponseTemplate');

export default responseTemplateMutations;
