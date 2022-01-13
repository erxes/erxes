import { ResponseTemplates } from '../../models';
import { IResponseTemplate } from '../../models/definitions/responseTemplates';

// import { MODULE_NAMES } from '../../constants';
// import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';

import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '@erxes/api-utils/src';

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
    { user, docModifier }: IContext
  ) {
    const template = await ResponseTemplates.create(docModifier(doc));

//     await putCreateLog(
//       {
//         type: MODULE_NAMES.RESPONSE_TEMPLATE,
//         newData: doc,
//         object: template
//       },
//       user
//     );

    return template;
  },

  /**
   * Updates a response template
   */
  async responseTemplatesEdit(
    _root,
    { _id, ...fields }: IResponseTemplatesEdit,
    { user }: IContext
  ) {
    const template = await ResponseTemplates.getResponseTemplate(_id);
    const updated = await ResponseTemplates.updateResponseTemplate(_id, fields);

//     await putUpdateLog(
//       {
//         type: MODULE_NAMES.RESPONSE_TEMPLATE,
//         object: template,
//         newData: fields,
//         updatedDocument: updated
//       },
//       user
//     );

    return updated;
  },

  /**
   * Deletes a response template
   */
  async responseTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const template = await ResponseTemplates.getResponseTemplate(_id);
    const removed = await ResponseTemplates.removeResponseTemplate(_id);

//     await putDeleteLog(
//       { type: MODULE_NAMES.RESPONSE_TEMPLATE, object: template },
//       user
//     );

    return removed;
  }
};

moduleCheckPermission(responseTemplateMutations, 'manageResponseTemplate');

export default responseTemplateMutations;