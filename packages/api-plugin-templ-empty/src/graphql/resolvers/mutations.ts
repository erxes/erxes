import { IContext } from '../../connectionResolver';
import { ITemplate } from '../../models/definitions/template';



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
  }
};

// commented out for testing purposes
// requireLogin(templateMutations, '{name}sAdd');

export default templateMutations;
