import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { TemplateDocument } from '../../../models/definitions/templates';

const templateMutations = {
  templateAdd: async (
    _root,
    doc: TemplateDocument,
    { user, models, subdomain }: IContext
  ) => {
    return await models.Templates.createTemplate(doc, subdomain, user);
  },

  templateEdit: async (
    _root,
    { _id, ...doc }: TemplateDocument,
    { user, models }: IContext
  ) => {
    return await models.Templates.updateTemplate(_id, doc, user);
  },

  templateRemove: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Templates.removeTemplate(_id);
  },

  templateUse: async (
    _root,
    { serviceName, contentType, template },
    { user, subdomain }: IContext
  ) => {
    return await sendCommonMessage({
      subdomain,
      serviceName,
      action: 'templates.useTemplate',
      data: {
        template,
        contentType,
        currentUser: user
      },
      isRPC: true
    });
  }
};

export default templateMutations;
