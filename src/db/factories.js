import faker from 'faker';
import Random from 'meteor-random';
import {
  NOTIFICATION_TYPES,
  COC_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
  FIELDS_GROUPS_CONTENT_TYPES,
  PRODUCT_TYPES,
} from '../data/constants';
import {
  Users,
  Integrations,
  Brands,
  EmailTemplates,
  ResponseTemplates,
  InternalNotes,
  Customers,
  ConversationMessages,
  Conversations,
  Tags,
  Segments,
  EngageMessages,
  Forms,
  Fields,
  Companies,
  NotificationConfigurations,
  Notifications,
  Channels,
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
  ActivityLogs,
  DealBoards,
  DealPipelines,
  DealStages,
  Deals,
  Products,
  Configs,
  FieldsGroups,
  ImportHistory,
} from './models';

export const userFactory = (params = {}) => {
  const user = new Users({
    username: params.username || faker.internet.userName(),
    details: {
      fullName: params.fullName || faker.random.word(),
      avatar: params.avatar || faker.image.imageUrl(),
      position: params.position || 'admin',
    },
    links: {
      twitter: params.twitter || faker.random.word(),
      facebook: params.facebook || faker.random.word(),
      linkedIn: params.linkedIn || faker.random.word(),
      youtube: params.youtube || faker.random.word(),
      github: params.github || faker.random.word(),
      website: params.website || faker.random.word(),
    },
    email: params.email || faker.internet.email(),
    role: params.role || 'contributor',
    password: params.password || '$2a$10$qfBFBmWmUjeRcR.nBBfgDO/BEbxgoai5qQhyjsrDUMiZC6dG7sg1q',
    isOwner: params.isOwner || false,
  });

  return user.save();
};

export const tagsFactory = (params = { type: 'engageMessage' }) => {
  const tag = new Tags({
    name: faker.random.word(),
    type: params.type || faker.random.word(),
    colorCode: params.colorCode || Random.id(),
    userId: Random.id(),
  });

  return tag.save();
};

export const engageMessageFactory = (params = {}) => {
  const engageMessage = new EngageMessages({
    kind: params.kind || 'manual',
    method: 'messenger',
    title: faker.random.word(),
    fromUserId: params.userId || faker.random.uuid(),
    segmentId: params.segmentId || faker.random.word(),
    tagIds: params.tagIds || [],
    isLive: params.isLive || false,
    isDraft: params.isDraft || false,
    messenger: {
      brandId: faker.random.word(),
      content: faker.random.word(),
    },
  });

  return engageMessage.save();
};

export const brandFactory = (params = {}) => {
  const brand = new Brands({
    name: faker.random.word(),
    code: params.code || faker.random.word(),
    userId: Random.id(),
    description: params.description || faker.random.word(),
    createdAt: new Date(),
    emailConfig: {
      type: 'simple',
      template: faker.random.word(),
    },
  });

  return brand.save();
};

export const emailTemplateFactory = (params = {}) => {
  const emailTemplate = new EmailTemplates({
    name: faker.random.word(),
    content: params.content || faker.random.word(),
  });

  return emailTemplate.save();
};

export const responseTemplateFactory = (params = {}) => {
  const responseTemplate = new ResponseTemplates({
    name: faker.random.word(),
    content: params.content || faker.random.word(),
    brandId: params.brandId || Random.id(),
    files: [faker.random.image()],
  });

  return responseTemplate.save();
};

export const segmentFactory = (params = {}) => {
  const defaultConditions = [
    {
      field: 'messengerData.sessionCount',
      operator: 'e',
      value: '10',
      dateUnit: 'days',
      type: 'string',
    },
  ];

  const segment = new Segments({
    contentType: params.contentType || COC_CONTENT_TYPES.CUSTOMER,
    name: faker.random.word(),
    description: params.description || faker.random.word(),
    subOf: params.subOf,
    color: params.color || '#809b87',
    connector: params.connector || 'any',
    conditions: params.conditions || defaultConditions,
  });

  return segment.save();
};

export const internalNoteFactory = (params = {}) => {
  const internalNote = new InternalNotes({
    contentType: params.contentType || COC_CONTENT_TYPES.CUSTOMER,
    contentTypeId: params.contentTypeId || faker.random.uuid(),
    content: params.content || faker.random.word(),
  });

  return internalNote.save();
};

export const companyFactory = (params = {}) => {
  const company = new Companies({
    primaryName: params.primaryName || faker.random.word(),
    names: params.names || [faker.random.word()],
    size: params.size || faker.random.number(),
    industry: params.industry || 'Airlines',
    website: params.website || faker.internet.domainName(),
    tagIds: params.tagIds || [faker.random.number()],
    plan: params.plan || faker.random.word(),
  });

  return company.save();
};

export const customerFactory = (params = {}) => {
  const customer = new Customers({
    firstName: params.firstName || faker.random.word(),
    lastName: params.lastName || faker.random.word(),
    primaryEmail: params.primaryEmail || faker.internet.email(),
    primaryPhone: params.primaryPhone || faker.phone.phoneNumber(),
    emails: params.emails || [faker.internet.email()],
    phones: params.phones || [faker.phone.phoneNumber()],
    messengerData: params.messengerData || {},
    customFieldsData: params.customFieldsData || {},
    companyIds: params.companyIds || [faker.random.number(), faker.random.number()],
    tagIds: params.tagIds || [faker.random.number(), faker.random.number()],
    twitterData: params.twitterData || { id: faker.random.number() },
  });

  return customer.save();
};

export const fieldFactory = async (params = {}) => {
  const groupObj = await fieldGroupFactory({});

  const field = new Fields({
    contentType: params.contentType || 'form',
    contentTypeId: params.contentTypeId || faker.random.uuid(),
    type: params.type || 'input',
    validation: params.validation || 'number',
    text: params.text || faker.random.word(),
    description: params.description || faker.random.word(),
    isRequired: params.isRequired || false,
    order: params.order || 0,
    isVisible: params.visible || true,
    groupId: params.groupId || groupObj._id,
  });

  await field.save();

  return Fields.updateField(field._id, params);
};

export const conversationFactory = (params = {}) => {
  const doc = {
    content: faker.lorem.sentence(),
    customerId: Random.id(),
    integrationId: Random.id(),
  };

  return Conversations.createConversation({
    ...doc,
    ...params,
  });
};

export const conversationMessageFactory = async (params = {}) => {
  let conversationId = params.conversationId;

  if (!conversationId) {
    const conversation = await conversationFactory({});
    conversationId = conversation._id;
  }

  return ConversationMessages.createMessage({
    content: params.content || faker.random.word(),
    attachments: {},
    mentionedUserIds: params.mentionedUserIds || [Random.id()],
    conversationId,
    internal: params.internal || true,
    customerId: params.customerId || Random.id(),
    userId: params.userId || Random.id(),
    createdAt: new Date(),
    isCustomerRead: params.isCustomerRead || true,
    engageData: params.engageData || {},
    formWidgetData: params.formWidgetData || {},
    facebookData: params.facebookData || {},
  });
};

export const integrationFactory = async (params = {}) => {
  const kind = params.kind || 'messenger';

  const doc = {
    name: params.name || faker.random.word(),
    kind,
    brandId: params.brandId || Random.id(),
    formId: params.formId || Random.id(),
    messengerData: { welcomeMessage: 'welcome', notifyCustomer: true },
    twitterData: params.twitterData || {},
    facebookData: params.facebookData || {},
    formData:
      params.formData === 'form'
        ? params.formData
        : kind === 'form' ? { thankContent: 'thankContent' } : null,
    tagIds: params.tagIds || [],
  };

  return Integrations.create(doc);
};

export const formFactory = async ({ title, code, description, createdUserId, submissions }) => {
  return Forms.createForm(
    {
      title: title || faker.random.word(),
      description: description || faker.random.word(),
      code: code || Random.id(),
      submissions: submissions || [],
    },
    createdUserId || (await userFactory({})),
  );
};

export const notificationConfigurationFactory = params => {
  let { isAllowed } = params;
  if (isAllowed == null) {
    isAllowed = true;
  }

  return NotificationConfigurations.createOrUpdateConfiguration(
    {
      notifType: params.notifType || NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      // which module's type it is. For example: indocuments
      isAllowed,
    },
    params.user || userFactory({}),
  );
};

export const notificationFactory = async params => {
  let receiver = params.receiver;

  if (!receiver) {
    receiver = await userFactory({});
  }

  return Notifications.createNotification(
    {
      notifType: params.notifType || NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      title: params.title || 'new Notification title',
      content: params.content || 'new Notification content',
      link: params.link || 'new Notification link',
      receiver: receiver._id,
    },
    params.createdUser,
  );
};

export const channelFactory = async (params = {}) => {
  const user = await userFactory({});

  const obj = Object.assign(
    {
      name: faker.random.word(),
      description: faker.lorem.sentence,
      integrationIds: params.integrationIds || [],
      memberIds: params.userId || [user._id],
      userId: user._id,
      conversationCount: 0,
      openConversationCount: 0,
      createdAt: new Date(),
    },
    params,
  );

  return Channels.create(obj);
};

export const knowledgeBaseTopicFactory = (params = {}, userId) => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    brandId: faker.random.word(),
    catgoryIds: [faker.random.word()],
  };

  if (params._id) {
    doc._id = params._id;
  }

  return KnowledgeBaseTopics.createDoc(
    {
      ...doc,
      ...params,
    },
    userId || faker.random.word(),
  );
};

export const knowledgeBaseCategoryFactory = (params = {}, userId) => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    articleIds: params.articleIds || [faker.random.word(), faker.random.word()],
    icon: faker.random.word(),
  };

  return KnowledgeBaseCategories.createDoc({ ...doc, ...params }, userId || faker.random.word());
};

export const knowledgeBaseArticleFactory = (params, userId) => {
  const doc = {
    title: faker.random.word(),
    summary: faker.lorem.sentence,
    content: faker.lorem.sentence,
    icon: faker.random.word(),
    categoryIds: params.categoryIds || [],
  };

  return KnowledgeBaseArticles.createDoc({ ...doc, ...params }, userId || faker.random.word());
};

export const activityLogFactory = (params, userId) => {
  const doc = {
    activity: {
      type: ACTIVITY_TYPES.INTERNAL_NOTE,
      action: ACTIVITY_ACTIONS.CREATE,
      id: faker.random.number(),
      content: faker.random.word(),
    },
    performer: {
      type: ACTIVITY_PERFORMER_TYPES.USER,
      id: faker.random.number(),
    },
    coc: {
      type: COC_CONTENT_TYPES.CUSTOMER,
      id: faker.random.number(),
    },
  };

  return ActivityLogs.createDoc({ ...doc, ...params }, userId || faker.random.word());
};

export const dealBoardFactory = (params = {}) => {
  const board = new DealBoards({
    name: faker.random.word(),
    userId: Random.id(),
    isDefault: params.isDefault || faker.random.boolean(),
  });

  return board.save();
};

export const dealPipelineFactory = (params = {}) => {
  const pipeline = new DealPipelines({
    name: faker.random.word(),
    boardId: params.boardId || faker.random.word(),
  });

  return pipeline.save();
};

export const dealStageFactory = (params = {}) => {
  const stage = new DealStages({
    name: faker.random.word(),
    pipelineId: params.pipelineId || faker.random.word(),
  });

  return stage.save();
};

export const dealFactory = (params = {}) => {
  const deal = new Deals({
    ...params,
    name: faker.random.word(),
    stageId: params.stageId || faker.random.word(),
    companyIds: [faker.random.word()],
    customerIds: [faker.random.word()],
    amount: faker.random.objectElement(),
    closeDate: new Date(),
    description: faker.random.word(),
    assignedUserIds: [faker.random.word()],
  });

  return deal.save();
};

export const productFactory = (params = {}) => {
  const product = new Products({
    name: params.name || faker.random.word(),
    type: params.type || PRODUCT_TYPES.PRODUCT,
    description: params.description || faker.random.word(),
    sku: faker.random.word(),
    createdAt: new Date(),
  });

  return product.save();
};

export const configFactory = (params = {}) => {
  const config = new Configs({
    ...params,
    code: faker.random.word(),
    value: [faker.random.word()],
  });

  return config.save();
};

export const fieldGroupFactory = async params => {
  const doc = {
    name: faker.random.word(),
    contentType: params.contentType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
    description: faker.random.word(),
    order: 1,
    isVisible: true,
  };

  const groupObj = await FieldsGroups.createGroup(doc, faker.random.word());

  return FieldsGroups.updateGroup(groupObj._id, params, faker.random.word());
};

export const importHistoryFactory = async params => {
  const user = await userFactory({});

  const doc = {
    failed: params.failed || faker.random.number(),
    total: params.total || faker.random.number(),
    success: params.success || faker.random.number(),
    ids: params.ids || [],
    contentType: params.contentType || 'customer',
  };

  return ImportHistory.createHistory({ ...doc, ...params, user }, faker.random.word());
};
