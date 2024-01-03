import {
  replacePlaceHolders,
  setProperty
} from '@erxes/api-utils/src/automations';
import { generateModels, IModels } from './connectionResolver';
import { sendCommonMessage, sendCoreMessage } from './messageBroker';

const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey
) => {
  if (
    [
      'userId',
      'assignedUserId',
      'closedUserId',
      'ownerId',
      'createdBy'
    ].includes(targetKey)
  ) {
    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: target[targetKey] },
      isRPC: true
    });

    return (
      (user && ((user.detail && user.detail.fullName) || user.email)) || ''
    );
  }

  if (
    ['participatedUserIds', 'assignedUserIds', 'watchedUserIds'].includes(
      targetKey
    )
  ) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: target[targetKey] }
        }
      },
      isRPC: true
    });

    return (
      users.map(user => (user.detail && user.detail.fullName) || user.email) ||
      []
    ).join(', ');
  }

  if (targetKey === 'tagIds') {
    const tags = await sendCommonMessage({
      subdomain,
      serviceName: 'tags',
      action: 'find',
      data: { _id: { $in: target[targetKey] } }
    });

    return (tags.map(tag => tag.name) || []).join(', ');
  }

  return false;
};

// find trigger related module items
const getItems = async (
  subdomain: string,
  module: string,
  execution: any,
  triggerType: string
) => {
  const { target } = execution;

  if (module === triggerType) {
    return [target];
  }

  const models = await generateModels(subdomain);

  let model: any = models.Customers;

  if (module.includes('company')) {
    model = models.Companies;
  }

  const [moduleService] = module.split(':');
  const [triggerService] = triggerType.split(':');

  if (moduleService === triggerService) {
    const relTypeIds = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'conformities.savedConformity',
      data: {
        mainType: triggerType.split(':')[1],
        mainTypeId: target._id,
        relTypes: [module.split(':')[1]]
      },
      isRPC: true
    });

    return model.find({ _id: { $in: relTypeIds } });
  }

  // send message to trigger service to get related value
  const filter = await sendCommonMessage({
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

  return filter ? model.find(filter) : [];
};

export default {
  receiveActions: async ({
    subdomain,
    data: { action, execution, triggerType, actionType }
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === 'set-property') {
      const { module, rules } = action.config;

      const relatedItems = await getItems(
        subdomain,
        module,
        execution,
        triggerType
      );

      return setProperty({
        models,
        subdomain,
        getRelatedValue,
        module: module.includes('lead') ? 'contacts:customer' : module,
        rules,
        execution,
        sendCommonMessage,
        relatedItems,
        triggerType
      });
    }
  },
  replacePlaceHolders: async ({
    subdomain,
    data: { target, config, relatedValueProps }
  }) => {
    const models = generateModels(subdomain);

    return await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: config,
      target,
      relatedValueProps
    });
  },
  getRecipientsEmails: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { type, config } = data;

    const commonFilter = {
      _id: { $in: config[`${type}Ids`] }
    };

    const CONTACT_TYPES = {
      lead: {
        model: models.Customers,
        filter: { ...commonFilter, state: 'lead' }
      },
      customer: {
        model: models.Customers,
        filter: {
          ...commonFilter,
          state: 'customer'
        }
      },
      company: {
        model: models.Companies,
        filter: { ...commonFilter }
      }
    };

    const { model, filter } = CONTACT_TYPES[type];

    return await model.find(filter).distinct('primaryEmail');
  },
  constants: {
    triggers: [
      {
        type: 'contacts:customer',
        img: 'automation2.svg',
        icon: 'users-alt',
        label: 'Customer',
        description:
          'Start with a blank workflow that enralls and is triggered off Customers'
      },
      {
        type: 'contacts:lead',
        img: 'automation2.svg',
        icon: 'users-alt',
        label: 'Lead',
        description:
          'Start with a blank workflow that enralls and is triggered off Leads'
      },
      {
        type: 'contacts:company',
        img: 'automation2.svg',
        icon: 'university',
        label: 'Company',
        description:
          'Start with a blank workflow that enralls and is triggered off company'
      }
    ],
    emailRecipientTypes: [
      {
        type: 'lead',
        name: 'leadIds',
        label: 'Leads'
      },
      {
        type: 'customer',
        name: 'customerIds',
        label: 'Customers'
      },
      {
        type: 'company',
        name: 'companyIds',
        label: 'Companies'
      }
    ]
  }
};
