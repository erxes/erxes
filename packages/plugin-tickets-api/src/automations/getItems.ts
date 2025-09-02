import { generateModels } from '../connectionResolver';
import { sendCommonMessage } from '../messageBroker';

export const getItems = async (
  subdomain: string,
  module: string,
  execution: any,
  triggerType: string
) => {
  const { target } = execution;

  if (module === triggerType) {
    return [target];
  }

  const [moduleService, moduleCollectionType] = module.split(':');
  const [triggerService, triggerCollectionType] = triggerType.split(':');

  const models = await generateModels(subdomain);

  let model = models.Tickets;

  if (moduleService === triggerService) {
    const relTypeIds = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'conformities.savedConformity',
      data: {
        mainType: triggerCollectionType,
        mainTypeId: target._id,
        relTypes: [moduleCollectionType]
      },
      isRPC: true
    });

    return model.find({ _id: { $in: relTypeIds } });
  }

  // search trigger service relation from relatedServices
  const relatedService = relatedServices(
    subdomain,
    triggerCollectionType,
    moduleCollectionType,
    target
  ).find((service) => service.name === triggerService);

  let filter: any = await relatedService?.filter();

  if (!relatedService) {
    // send message to trigger service to get related value
    filter = await sendCommonMessage({
      subdomain,
      serviceName: triggerService,
      action: 'getModuleRelation',
      data: {
        module,
        triggerType,
        target
      },
      isRPC: true,
      defaultValue: null
    });
  }

  return filter ? await model.find(filter) : [];
};

const relatedServices = (
  subdomain: string,
  triggerCollectionType: string,
  moduleCollectionType: string,
  target: any
) => [
  {
    name: 'contacts',
    filter: async () => {
      if (target.isFormSubmission) {
        return { sourceConversationIds: { $in: [target.conversationId] } };
      }

      const relTypeIds = await sendCommonMessage({
        subdomain,
        serviceName: 'core',
        action: 'conformities.savedConformity',
        data: {
          mainType: triggerCollectionType,
          mainTypeId: target._id,
          relTypes: [moduleCollectionType]
        },
        isRPC: true,
        defaultValue: []
      });

      if (!relTypeIds.length) {
        return;
      }

      return { _id: { $in: relTypeIds } };
    }
  },
  {
    name: 'inbox',
    filter: async () => ({
      sourceConversationIds: { $in: [target._id] }
    })
  }
];
