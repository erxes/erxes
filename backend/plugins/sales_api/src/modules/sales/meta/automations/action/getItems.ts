import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

const relatedPlugins = (
  subdomain: string,
  triggerCollectionType: string,
  moduleCollectionType: string,
  target: any,
) => ([
  {
    name: 'core',
    filter: async () => {
      if (target.isFormSubmission) {
        return { sourceConversationIds: { $in: [target.conversationId] } };
      }

      const relTypeIds = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'relation',
        action: 'getRelationIds',
        input: {
          contentType: triggerCollectionType,
          contentId: target._id,
          relatedContentType: moduleCollectionType,
        },
        defaultValue: [],
      });

      if (!relTypeIds.length) {
        return;
      }

      return { _id: { $in: relTypeIds } };
    },
  },
  {
    name: 'frontline',
    filter: async () => ({
      sourceConversationIds: { $in: [target._id] },
    }),
  },
]);

export const getItems = async (
  subdomain: string,
  module: string,
  execution: any,
  triggerType: string,
) => {
  const { target } = execution;

  if (module === triggerType) {
    return [target];
  }

  const [moduleService, moduleCollectionType] = module.split(':');
  const [pluginName, triggerCollectionType] = triggerType.split(':');

  const models = await generateModels(subdomain);

  if (moduleService === pluginName) {
    const relTypeIds = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'getRelationIds',
      input: {
        contentType: triggerCollectionType,
        contentId: target._id,
        relatedContentType: moduleCollectionType,
      },
      defaultValue: [],
    });

    return models.Deals.find({ _id: { $in: relTypeIds } });
  }

  // search trigger plugin relation from relatedServices
  const relatedService = relatedPlugins(
    subdomain,
    triggerCollectionType,
    moduleCollectionType,
    target,
  ).find((plugin) => plugin.name === pluginName);

  let filter: any = await relatedService?.filter();

  if (!relatedService) {
    // send message to trigger plugin to get related value
    filter = await sendTRPCMessage({
      subdomain,
      pluginName: pluginName,
      module: 'relation',
      action: 'getModuleRelation',
      input: {
        module,
        triggerType,
        target,
      },
      defaultValue: null,
    });
  }

  return filter ? await models.Deals.find(filter) : [];
};
