import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ITemplate } from '../../@types';

const templateMutations = {
  templateAdd: async (
    _root: undefined,
    doc: ITemplate,
    { user, models }: IContext,
  ) => {
    return await models.Template.createTemplate(doc, user);
  },

  templateEdit: async (
    _root: undefined,
    { _id, ...doc }: ITemplate & { _id: string },
    { user, models }: IContext,
  ) => {
    return await models.Template.updateTemplate(_id, doc, user);
  },

  templateRemove: async (
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) => {
    return await models.Template.removeTemplates(_ids);
  },

  templateUse: async (
    _root: undefined,
    { _id }: { _id: string },
    { user, subdomain, models }: IContext,
  ) => {
    const template: ITemplate = await models.Template.getTemplate(_id);

    const { contentType = '' } = template || {};

    const [pluginName, moduleName] = contentType?.split(':');

    if (!pluginName || moduleName) {
      throw new Error('Invalid template document');
    }

    return await sendTRPCMessage({
      subdomain,
      pluginName,
      method: 'mutation',
      module: moduleName,
      action: 'useTemplate',
      input: {
        template,
        currentUser: user,
      },
      defaultValue: {},
    });
  },

  
};

export default templateMutations;
