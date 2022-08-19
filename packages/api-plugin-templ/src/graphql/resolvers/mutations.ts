import { IContext } from '../../connectionResolver';
import {
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { ITemplate } from '../../models/definitions/template';

const templateMutations = {
  /**
   * Creates a new template
   */
  async templatesAdd(
    _root,
    doc: ITemplate,
    { models }: IContext
  ) {
    const template = await models.Templates.createTemplate(doc);

    return template;
  },

};

requireLogin(templateMutations, 'templatesAdd');

export default templateMutations;