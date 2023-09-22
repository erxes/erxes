import {
  replacePlaceHolders,
  setProperty
} from '@erxes/api-utils/src/automations';
import { generateModels, IModels } from './connectionResolver';
import { itemsAdd } from './graphql/resolvers/mutations/utils';
import {
  sendCommonMessage,
  sendContactsMessage,
  sendCoreMessage
} from './messageBroker';
import { getCollection } from './models/utils';

const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey,
  relatedValueProps?: any
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

    if (!!relatedValueProps[targetKey]) {
      const key = relatedValueProps[targetKey]?.key;
      return user[key];
    }

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

    if (!!relatedValueProps[targetKey]) {
      const { key, filter } = relatedValueProps[targetKey] || {};
      return users
        .filter(user => (filter ? user[filter.key] === filter.value : user))
        .map(user => user[key])
        .join(', ');
    }

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
      data: { _id: { $in: target[targetKey] } },
      isRPC: true
    });

    return (tags.map(tag => tag.name) || []).join(', ');
  }

  if (targetKey === 'labelIds') {
    const labels = await models.PipelineLabels.find({
      _id: { $in: target[targetKey] }
    });

    return (labels.map(label => label.name) || []).join(', ');
  }

  if (['initialStageId', 'stageId'].includes(targetKey)) {
    const stage = await models.Stages.findOne({
      _id: target[targetKey]
    });

    return (stage && stage.name) || '';
  }

  if (['sourceConversationIds'].includes(targetKey)) {
    const conversations = await sendCommonMessage({
      subdomain,
      serviceName: 'inbox',
      action: 'conversations.find',
      data: { _id: { $in: target[targetKey] } },
      isRPC: true
    });

    return (conversations.map(c => c.content) || []).join(', ');
  }

  if (['customers', 'companies'].includes(targetKey)) {
    const relTypeConst = {
      companies: 'company',
      customers: 'customer'
    };

    const contactIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: target.type,
        mainTypeId: target._id,
        relTypes: [relTypeConst[targetKey]]
      },
      isRPC: true,
      defaultValue: []
    });

    const upperCasedTargetKey =
      targetKey.charAt(0).toUpperCase() + targetKey.slice(1);

    const activeContacts = await sendContactsMessage({
      subdomain,
      action: `${targetKey}.findActive${upperCasedTargetKey}`,
      data: { selector: { _id: { $in: contactIds } } },
      isRPC: true,
      defaultValue: []
    });

    if (!!relatedValueProps[targetKey]) {
      const { key, filter } = relatedValueProps[targetKey] || {};
      return activeContacts
        .filter(contacts =>
          filter ? contacts[filter.key] === filter.value : contacts
        )
        .map(contacts => contacts[key])
        .join(', ');
    }

    return activeContacts
      .map(contact => {
        if (targetKey === 'customers') {
          return `${contact?.firstName || ''} ${contact?.middleName ||
            ''} ${contact?.lastName || ''}`;
        }
        if (targetKey === 'companies') {
          return contact?.primaryName || '';
        }
      })
      .join(', ');
  }

  return false;
};

// module related services
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

  const [moduleService, moduleCollectionType] = module.split(':');
  const [triggerService, triggerCollectionType] = triggerType.split(':');

  const models = await generateModels(subdomain);

  let model: any;

  switch (moduleCollectionType) {
    case 'task':
      model = models.Tasks;
      break;
    case 'purchase':
      model = models.Purchases;
      break;
    case 'ticket':
      model = models.Tickets;
      break;
    default:
      model = models.Deals;
  }

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
  ).find(service => service.name === triggerService);

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

export default {
  receiveActions: async ({
    subdomain,
    data: { action, execution, collectionType, triggerType, actionType }
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === 'create') {
      return actionCreate({
        models,
        subdomain,
        action,
        execution,
        collectionType
      });
    }

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
      module,
      rules,
      execution,
      relatedItems,
      sendCommonMessage
    });
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
  constants: {
    triggers: [
      {
        type: 'cards:task',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Task',
        description:
          'Start with a blank workflow that enralls and is triggered off task'
      },
      {
        type: 'cards:purchase',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Purchase',
        description:
          'Start with a blank workflow that enralls and is triggered off purchase'
      },
      {
        type: 'cards:ticket',
        img: 'automation3.svg',
        icon: 'file-plus',
        label: 'Ticket',
        description:
          'Start with a blank workflow that enralls and is triggered off ticket'
      },
      {
        type: 'cards:deal',
        img: 'automation3.svg',
        icon: 'piggy-bank',
        label: 'Sales pipeline',
        description:
          'Start with a blank workflow that enralls and is triggered off sales pipeline item'
      }
    ],
    actions: [
      {
        type: 'cards:task.create',
        icon: 'file-plus-alt',
        label: 'Create task',
        description: 'Create task',
        isAvailable: true
      },
      {
        type: 'cards:purchase.create',
        icon: 'file-plus-alt',
        label: 'Create purchase',
        description: 'Create purchase',
        isAvailable: true
      },
      {
        type: 'cards:deal.create',
        icon: 'piggy-bank',
        label: 'Create deal',
        description: 'Create deal',
        isAvailable: true
      },
      {
        type: 'cards:ticket.create',
        icon: 'file-plus',
        label: 'Create ticket',
        description: 'Create ticket',
        isAvailable: true
      }
    ]
  }
};

const generateIds = value => {
  const arr = value.split(', ');

  if (Array.isArray(arr)) {
    return arr;
  }

  if (!arr.match(/\{\{\s*([^}]+)\s*\}\}/g)) {
    return [arr];
  }

  return [];
};

const actionCreate = async ({
  models,
  subdomain,
  action,
  execution,
  collectionType
}) => {
  const { config = {} } = action;
  let { target, triggerType } = execution || {};
  let relatedValueProps = {};

  let newData = action.config.assignedTo
    ? await replacePlaceHolders({
        models,
        subdomain,
        getRelatedValue,
        actionData: { assignedTo: action.config.assignedTo },
        target: { ...target, type: (triggerType || '').replace('cards:', '') },
        isRelated: false
      })
    : {};

  delete action.config.assignedTo;

  if (!!config.customers) {
    relatedValueProps['customers'] = { key: '_id' };
    target.customers = config.customers;
  }
  if (!!config.companies) {
    relatedValueProps['companies'] = { key: '_id' };
    target.companies = config.companies;
  }

  newData = {
    ...newData,
    ...(await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: action.config,
      target: { ...target, type: (triggerType || '').replace('cards:', '') },
      relatedValueProps
    }))
  };

  if (execution.target.userId) {
    newData.userId = execution.target.userId;
  }

  if (execution.triggerType === 'inbox:conversation') {
    newData.sourceConversationIds = [execution.targetId];
  }

  if (
    ['contacts:customer', 'contacts:lead'].includes(execution.triggerType) &&
    execution.target.isFormSubmission
  ) {
    newData.sourceConversationIds = [execution.target.conversationId];
  }

  if (newData.hasOwnProperty('assignedTo')) {
    newData.assignedUserIds = newData.assignedTo.trim().split(', ');
  }

  if (newData.hasOwnProperty('labelIds')) {
    newData.labelIds = newData.labelIds.trim().split(', ');
  }

  if (newData.hasOwnProperty('cardName')) {
    newData.name = newData.cardName;
  }

  if (config.hasOwnProperty('stageId')) {
    newData.stageId = config.stageId;
  }

  if (!!newData?.customers) {
    newData.customerIds = generateIds(newData.customers);
  }
  if (!!newData?.companies) {
    newData.companyIds = generateIds(newData.companies);
  }

  if (Object.keys(newData).some(key => key.startsWith('customFieldsData'))) {
    const customFieldsData: Array<{ field: string; value: string }> = [];

    const fieldKeys = Object.keys(newData).filter(key =>
      key.startsWith('customFieldsData')
    );

    for (const fieldKey of fieldKeys) {
      const [, fieldId] = fieldKey.split('.');

      customFieldsData.push({
        field: fieldId,
        value: newData[fieldKey]
      });
    }
    newData.customFieldsData = customFieldsData;
  }

  if (newData.hasOwnProperty('attachments')) {
    const [serviceName, itemType] = triggerType.split(':');
    if (serviceName === 'cards') {
      const modelsMap = {
        ticket: models.Tickets,
        task: models.Tasks,
        deal: models.Deals,
        purchase: models.Purchases
      };

      const item = await modelsMap[itemType].findOne({ _id: target._id });
      newData.attachments = item.attachments;
    }
  }

  try {
    const { create } = getCollection(models, collectionType);

    const item = await itemsAdd(
      models,
      subdomain,
      newData,
      collectionType,
      create
    );

    if (execution.triggerType === 'inbox:conversation') {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'customer',
          mainTypeId: execution.target.customerId,
          relType: `${collectionType}`,
          relTypeId: item._id
        }
      });
    } else {
      const mainType = execution.triggerType.split(':')[1];

      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: mainType.replace('lead', 'customer'),
          mainTypeId: execution.targetId,
          relType: `${collectionType}`,
          relTypeId: item._id
        }
      });
    }

    return {
      name: item.name,
      itemId: item._id,
      stageId: item.stageId,
      pipelineId: newData.pipelineId,
      boardId: newData.boardId
    };
  } catch (e) {
    return { error: e.message };
  }
};
