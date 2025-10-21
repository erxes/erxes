import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

const relatedServices = (
  subdomain: string,
  triggerCollectionType: string,
  moduleCollectionType: string,
  target: any,
) => [
  {
    name: 'contacts',
    filter: async () => {
      if (target.isFormSubmission) {
        return { sourceConversationIds: { $in: [target.conversationId] } };
      }

      const relTypeIds = await sendTRPCMessage({
        pluginName: 'core',
        module: 'conformities',
        action: 'savedConformity',
        input: {
          mainType: triggerCollectionType,
          mainTypeId: target._id,
          relTypes: [moduleCollectionType],
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
    name: 'inbox',
    filter: async () => ({
      sourceConversationIds: { $in: [target._id] },
    }),
  },
];

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
  const [triggerService, triggerCollectionType] = triggerType.split(':');

  const models = await generateModels(subdomain);

  if (moduleService === triggerService) {
    const relTypeIds = await sendTRPCMessage({
      pluginName: 'core',
      module: 'conformities',
      action: 'savedConformity',
      input: {
        mainType: triggerCollectionType,
        mainTypeId: target._id,
        relTypes: [moduleCollectionType],
      },
    });

    return models.Deals.find({ _id: { $in: relTypeIds } });
  }

  // search trigger service relation from relatedServices
  const relatedService = relatedServices(
    subdomain,
    triggerCollectionType,
    moduleCollectionType,
    target,
  ).find((service) => service.name === triggerService);

  let filter: any = await relatedService?.filter();

  if (!relatedService) {
    // send message to trigger service to get related value
    filter = await sendTRPCMessage({
      pluginName: triggerService,
      module: 'conformities',
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
