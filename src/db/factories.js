import faker from 'faker';
import Random from 'meteor-random';
import {
  MODULES,
  COC_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
  FIELDS_GROUPS_CONTENT_TYPES,
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
  FieldsGroups,
} from './models';

export const userFactory = (params = {}) => {
  const user = new Users({
    username: params.username || faker.internet.userName(),
    details: {
      fullName: params.fullName || faker.random.word(),
      avatar: params.avatar || faker.image.imageUrl(),
      twitterUsername: params.twitterUsername || faker.internet.userName(),
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
    kind: 'manual',
    method: 'messenger',
    title: faker.random.word(),
    fromUserId: params.userId || faker.random.word(),
    segmentId: params.segmentId || faker.random.word(),
    isLive: true,
    isDraft: false,
    messenger: {
      brandId: faker.random.word(),
      content: faker.random.word(),
    },
  });

  return engageMessage.save();
};

export const segmentsFactory = () => {
  const segment = new Segments({
    name: faker.random.word(),
  });

  return segment.save();
};

export const brandFactory = (params = {}) => {
  const brand = new Brands({
    name: faker.random.word(),
    code: params.code || faker.random.word(),
    userId: Random.id(),
    description: params.description || faker.random.word(),
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
    contentType: COC_CONTENT_TYPES.CUSTOMER || params.contentType,
    name: faker.random.word(),
    description: params.description || faker.random.word(),
    subOf: params.subOf || 'DFSAFDFDSFDSF',
    color: params.color || '#ffff',
    connector: params.connector || 'any',
    conditions: params.conditions || defaultConditions,
  });

  return segment.save();
};

export const internalNoteFactory = (params = {}) => {
  const internalNote = new InternalNotes({
    contentType: params.contentType || COC_CONTENT_TYPES.CUSTOMER,
    contentTypeId: params.contentTypeId || 'DFASFDFSDAFDF',
    content: params.content || faker.random.word(),
  });

  return internalNote.save();
};

export const companyFactory = (params = {}) => {
  const company = new Companies({
    name: params.name || faker.random.word(),
    size: params.size || faker.random.number(),
    industry: params.industry || faker.company.bs(),
    website: params.website || faker.internet.domainName(),
    tagIds: params.tagIds || [faker.random.number()],
  });

  return company.save();
};

export const customerFactory = (params = {}) => {
  const customer = new Customers({
    firstName: params.firstName || faker.random.word(),
    lastName: params.lastName || faker.random.word(),
    email: params.email || faker.internet.email(),
    phone: params.phone || faker.phone.phoneNumber(),
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
    contentTypeId: params.contentTypeId || 'DFAFDASFDASFDSFDASFASF',
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
    name: faker.random.word(),
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
  };

  return Integrations.create(doc);
};

export const formFactory = async ({ title, code, description, createdUserId }) => {
  return Forms.createForm(
    {
      title: title || faker.random.word(),
      description: description || faker.random.word(),
      code: code || Random.id(),
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
      notifType: params.notifType || MODULES.CHANNEL_MEMBERS_CHANGE,
      // which module's type it is. For example: indocuments
      isAllowed,
    },
    params.user || userFactory({}),
  );
};

export const notificationFactory = params => {
  return Notifications.createNotification({
    notifType: params.notifType || MODULES.CHANNEL_MEMBERS_CHANGE,
    createdUser: params.createdUser || userFactory({}),
    title: params.title || 'new Notification title',
    content: params.content || 'new Notification content',
    link: params.link || 'new Notification link',
    receiver: params.receiver || userFactory({}),
  });
};

export const channelFactory = async (params = {}) => {
  const user = await userFactory({});

  const obj = Object.assign(
    {
      name: faker.random.word(),
      description: faker.lorem.sentence,
      integrationIds: [],
      memberIds: [user._id],
      userId: user._id,
      conversationCount: 0,
      openConversationCount: 0,
      createdAt: new Date(),
    },
    params,
  );

  return Channels.create(obj);
};

export const knowledgeBaseTopicFactory = params => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    brandId: faker.random.word(),
    catgoryIds: [faker.random.word()],
  };

  return KnowledgeBaseTopics.createDoc(
    {
      ...doc,
      ...params,
    },
    faker.random.word(),
  );
};

export const knowledgeBaseCategoryFactory = (params = {}) => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    articleIds: params.articleIds || [faker.random.word(), faker.random.word()],
    icon: faker.random.word(),
  };

  return KnowledgeBaseCategories.createDoc({ ...doc, ...params }, faker.random.word());
};

export const knowledgeBaseArticleFactory = params => {
  const doc = {
    title: faker.random.word(),
    summary: faker.lorem.sentence,
    content: faker.lorem.sentence,
    icon: faker.random.word(),
    categoryIds: params.categoryIds || [],
  };

  return KnowledgeBaseArticles.createDoc({ ...doc, ...params }, faker.random.word());
};

export const activityLogFactory = params => {
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

  return ActivityLogs.createDoc({ ...doc, ...params }, faker.random.word());
};

export const fieldGroupFactory = async params => {
  const doc = {
    name: faker.random.word(),
    contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
    description: faker.random.word(),
    order: 1,
    isVisible: true,
  };

  const groupObj = await FieldsGroups.createGroup(doc, faker.random.word());

  return FieldsGroups.updateGroup(groupObj._id, params, faker.random.word());
};
