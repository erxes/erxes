import { IContext } from '../../../../../connectionResolvers';
import { ITemplateInput } from '../../../db/definitions/template';
import { sendTRPCMessage, getSubdomain } from 'erxes-api-shared/utils';

export const templateMutations = {
  templateAdd: async (
    _parent: undefined,
    { doc }: { doc: ITemplateInput },
    { models, user }: IContext,
  ) => {
    return models.Template.createTemplate(doc, user);
  },

  templateEdit: async (
    _parent: undefined,
    { _id, doc }: { _id: string; doc: Partial<ITemplateInput> },
    { models, user }: IContext,
  ) => {
    return models.Template.updateTemplate(_id, doc, user);
  },

  templateRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Template.removeTemplate(_id);
  },

  templateUse: async (
    _parent: undefined,
    {
      _id,
      contentType,
      relTypeId,
    }: { _id: string; contentType?: string; relTypeId?: string },
    { models, req, user }: IContext,
  ) => {
    const template = await models.Template.getTemplate(_id);

    if (!template) {
      throw new Error('Template not found');
    }

    const fullContentType = (contentType || template.contentType) as
      | string
      | undefined;

    if (!fullContentType || !fullContentType.includes(':')) {
      return {
        _id: template._id,
        name: template.name,
        content: template.content,
        contentType: template.contentType,
      };
    }

    const subdomain = getSubdomain(req);
    const [serviceName] = fullContentType.split(':');

    if (!serviceName) {
      return {
        _id: template._id,
        name: template.name,
        content: template.content,
        contentType: template.contentType,
      };
    }

    // Try to send TRPC message, fallback to template if fails
    try {
      const result = await sendTRPCMessage({
        subdomain,
        pluginName: serviceName,
        method: 'mutation',
        module: 'templates',
        action: 'useTemplate',
        input: {
          template,
          contentType: fullContentType,
          currentUser: user,
          relTypeId,
        },
        defaultValue: null,
      });

      return result || template;
    } catch (error) {
      return {
        _id: template._id,
        name: template.name,
        content: template.content,
        contentType: template.contentType,
      };
    }
  },

  templateSaveFrom: async (
    _parent: undefined,
    {
      sourceId,
      contentType,
      name,
      description,
      status,
    }: {
      sourceId: string;
      contentType: string;
      name: string;
      description?: string;
      status?: string;
    },
    { models, req, user }: IContext,
  ) => {
    if (!contentType || !contentType.includes(':')) {
      throw new Error('Invalid contentType format. Expected: plugin:type');
    }

    const subdomain = getSubdomain(req);
    const [pluginName] = contentType.split(':');

    if (!pluginName) {
      throw new Error('Invalid contentType format. Expected: plugin:type');
    }

    const result = await sendTRPCMessage({
      subdomain,
      pluginName,
      method: 'mutation',
      module: 'templates',
      action: 'saveAsTemplate',
      input: {
        sourceId,
        contentType,
        name,
        description,
        status,
        currentUser: user,
      },
    });

    if (!result || result.status === 'error') {
      throw new Error(result?.errorMessage || 'Failed to save as template');
    }

    // Create template with data from source plugin
    const template = await models.Template.createTemplate(
      {
        name,
        content: result.data.content,
        contentType,
        pluginType: pluginName,
        description: description || result.data.description,
        status: 'active',
      },
      user,
    );

    return {
      status: 'success',
      data: {
        templateId: template._id,
        message: 'Template saved successfully',
      },
    };
  },
};
