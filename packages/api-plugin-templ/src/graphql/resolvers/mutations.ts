import { IContext } from '../../connectionResolver';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { ITemplate, IType } from '../../models/definitions/template';
import { putUpdateLog } from '@erxes/api-utils/src/logUtils';
import messageBroker from '../../messageBroker';

interface ITemplateEdit extends ITemplate {
  _id: string;
}

const templateMutations = {
  /**
   * Creates a new {name}
   */
  async {name}sAdd(_root, doc: ITemplate, { models }: IContext) {
    const template = await models.Templates.createTemplate(doc);

    return template;
  },
  /**
   * Edits a new {name}
   */
  async {name}sEdit(
    _root,
    { _id, ...doc }: ITemplateEdit,
    { models, subdomain, user }: IContext
  ) {
    const {name} = await models.Templates.getTemplate(_id);
    const updated = await models.Templates.updateTemplate(_id, doc);
    await putUpdateLog(
      subdomain,
      messageBroker(),
      { type: '{name}', object: {name}, newData: doc },
      user
    );

    return updated;
  },
  /**
   * Removes a single {name}
   */
  async {name}sRemove(_root, { _id }, { models }: IContext) {
    const template = await models.Templates.removeTemplate(_id);
    return template;
  },

  /**
   * Creates a new type for {name}
   */
  async {name}TypesAdd(_root, doc: ITemplate, { models }: IContext) {
    const type = await models.Types.createType(doc);
    return type;
  },

  async {name}TypesRemove(_root, { _id }, { models }: IContext) {
    const type = await models.Types.removeType(_id);
    return type;
  },

  async {name}TypesEdit(
    _root,
    { _id, ...doc }: ITemplateEdit,
    { models, subdomain, user }: IContext
  ) {
    const type = await models.Types.getType(_id);
    const updated = await models.Types.updateType(_id, doc);
    await putUpdateLog(
      subdomain,
      messageBroker(),
      { type: 'type', object: type, newData: doc },
      user
    );

    return updated;
  }
};

// commented out for testing purposes
// requireLogin(templateMutations, '{name}sAdd');

export default templateMutations;
