import { IContext } from '../../../../../connectionResolvers';
import { ITemplateInput } from '../../../db/definitions/template';
import { sendTRPCMessage, getSubdomain } from 'erxes-api-shared/utils';
import { templatesRouter } from '~/modules/products/trpc/template';

interface ITemplateAddInput extends Partial<ITemplateInput> {
  name: string;
  sourceId?: string;
  sourceIds?: string[];
  contentType?: string;
}

export const templateMutations = {
  templateAdd: async (
    _parent: undefined,
    { doc }: { doc: ITemplateAddInput },
    { models, user, req }: IContext,
  ) => {
    const { sourceId, sourceIds, ...templateDoc } = doc;

    // If sourceId or sourceIds provided, fetch content from plugin via TRPC
    if ((sourceId || sourceIds) && templateDoc.contentType) {
      const contentType = templateDoc.contentType;

      if (!contentType.includes(':')) {
        throw new Error('Invalid contentType format. Expected: plugin:type');
      }

      const subdomain = getSubdomain(req);
      const [pluginName] = contentType.split(':');

      if (!pluginName) {
        throw new Error('Invalid contentType format. Expected: plugin:type');
      }

      let result;

      if (sourceIds && sourceIds.length > 0) {
        // Multiple sources
        if (pluginName === 'core') {
          const caller = templatesRouter.createCaller({ models, subdomain });
          result = await caller.saveAsTemplateMulti({
            sourceIds,
            contentType,
            name: templateDoc.name,
            description: templateDoc.description,
          });
        } else {
          result = await sendTRPCMessage({
            subdomain,
            pluginName,
            method: 'mutation',
            module: 'templates',
            action: 'saveAsTemplateMulti',
            input: {
              sourceIds,
              contentType,
              name: templateDoc.name,
              description: templateDoc.description,
              status: templateDoc.status,
              currentUser: user,
            },
          });
        }
      } else if (sourceId) {
        // Single source
        if (pluginName === 'core') {
          const caller = templatesRouter.createCaller({ models, subdomain });
          result = await caller.saveAsTemplate({
            sourceId,
            contentType,
            name: templateDoc.name,
            description: templateDoc.description,
          });
        } else {
          result = await sendTRPCMessage({
            subdomain,
            pluginName,
            method: 'mutation',
            module: 'templates',
            action: 'saveAsTemplate',
            input: {
              sourceId,
              contentType,
              name: templateDoc.name,
              description: templateDoc.description,
              status: templateDoc.status,
              currentUser: user,
            },
          });
        }
      }

      if (!result || result.status === 'error') {
        throw new Error(
          result?.errorMessage || 'Failed to fetch template content',
        );
      }

      // Create template with fetched content
      return models.Template.createTemplate(
        {
          name: templateDoc.name,
          content: result.data.content,
          contentType,
          pluginType: pluginName,
          description: templateDoc.description || result.data.description,
          categoryIds: templateDoc.categoryIds,
          status: templateDoc.status || 'active',
        },
        user,
      );
    }

    // Direct content provided - create template directly
    return models.Template.createTemplate(templateDoc as ITemplateInput, user);
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

    const templateData = template.toObject
      ? template.toObject()
      : { ...template };

    const trpcInput = {
      template: {
        content: templateData.content,
        contentType: templateData.contentType,
        description: templateData.description,
      },
      contentType: fullContentType,
      currentUser: user ? { _id: user._id } : undefined,
      relTypeId,
    };

    let result;

    // If serviceName is 'core', call the templates router directly instead of HTTP
    if (serviceName === 'core') {
      const caller = templatesRouter.createCaller({ models, subdomain });
      result = await caller.useTemplate(trpcInput);
    } else {
      result = await sendTRPCMessage({
        subdomain,
        pluginName: serviceName,
        method: 'mutation',
        module: 'templates',
        action: 'useTemplate',
        input: trpcInput,
      });
    }

    if (!result || result.status === 'error') {
      throw new Error(result?.errorMessage || 'Failed to use template');
    }

    return result;
  },
};
