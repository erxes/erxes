import { dateType } from 'aws-sdk/clients/sts'; // tslint:disable-line
import * as faker from 'faker';
import * as Random from 'meteor-random';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../data/constants';
import { IActionPerformer, IActivity, IContentType } from '../db/models/definitions/activityLogs';
import {
  ActivityLogs,
  Boards,
  Brands,
  Channels,
  Companies,
  Configs,
  ConversationMessages,
  Conversations,
  Customers,
  Deals,
  EmailTemplates,
  EngageMessages,
  Fields,
  FieldsGroups,
  Forms,
  ImportHistory,
  Integrations,
  InternalNotes,
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  KnowledgeBaseTopics,
  MessengerApps,
  NotificationConfigurations,
  Notifications,
  Permissions,
  Pipelines,
  Products,
  ResponseTemplates,
  Segments,
  Stages,
  Tags,
  Tasks,
  Tickets,
  Users,
  UsersGroups,
} from './models';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  BOARD_TYPES,
  NOTIFICATION_TYPES,
  PRODUCT_TYPES,
  STATUSES,
} from './models/definitions/constants';
import { IEmail, IMessenger } from './models/definitions/engages';
import { IMessengerAppCrendentials } from './models/definitions/messengerApps';
import { IUserDocument } from './models/definitions/users';

interface IActivityLogFactoryInput {
  performer?: IActionPerformer;
  performedBy?: IActionPerformer;
  activity?: IActivity;
  contentType?: IContentType;
}

export const activityLogFactory = (params: IActivityLogFactoryInput) => {
  const doc = {
    activity: {
      type: ACTIVITY_TYPES.INTERNAL_NOTE,
      action: ACTIVITY_ACTIONS.CREATE,
      id: faker.random.uuid(),
      content: faker.random.word(),
    },
    performer: {
      type: ACTIVITY_PERFORMER_TYPES.USER,
      id: faker.random.uuid(),
    },
    contentType: {
      type: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      id: faker.random.uuid(),
    },
  };

  return ActivityLogs.createDoc({ ...doc, ...params });
};

interface IUserFactoryInput {
  username?: string;
  fullName?: string;
  avatar?: string;
  position?: string;
  twitter?: string;
  facebook?: string;
  linkedIn?: string;
  youtube?: string;
  github?: string;
  website?: string;
  email?: string;
  password?: string;
  isOwner?: boolean;
  isActive?: boolean;
  groupIds?: string[];
  registrationToken?: string;
  registrationTokenExpires?: Date;
}

export const userFactory = (params: IUserFactoryInput = {}) => {
  const user = new Users({
    username: params.username || faker.internet.userName(),
    details: {
      fullName: params.fullName || faker.random.word(),
      avatar: params.avatar || faker.image.imageUrl(),
      position: params.position || 'admin',
    },
    registrationToken: params.registrationToken,
    registrationTokenExpires: params.registrationTokenExpires,
    links: {
      twitter: params.twitter || faker.random.word(),
      facebook: params.facebook || faker.random.word(),
      linkedIn: params.linkedIn || faker.random.word(),
      youtube: params.youtube || faker.random.word(),
      github: params.github || faker.random.word(),
      website: params.website || faker.random.word(),
    },
    email: params.email || faker.internet.email(),
    password: params.password || '$2a$10$qfBFBmWmUjeRcR.nBBfgDO/BEbxgoai5qQhyjsrDUMiZC6dG7sg1q',
    isOwner: typeof params.isOwner !== 'undefined' ? params.isOwner : true,
    isActive: params.isActive || true,
    groupIds: params.groupIds || [],
  });

  return user.save();
};

interface ITagFactoryInput {
  colorCode?: string;
  type?: string;
}

export const tagsFactory = (params: ITagFactoryInput = {}) => {
  const tag = new Tags({
    name: faker.random.word(),
    type: params.type || 'engageMessage',
    colorCode: params.colorCode || Random.id(),
    userId: Random.id(),
  });

  return tag.save();
};

interface IEngageMessageFactoryInput {
  kind?: string;
  userId?: string;
  segmentIds?: string[];
  brandIds?: string[];
  tagIds?: string[] | string;
  isLive?: boolean;
  isDraft?: boolean;
  customerIds?: string[];
  method?: string;
  messenger?: IMessenger;
  title?: string;
  email?: IEmail;
}

export const engageMessageFactory = (params: IEngageMessageFactoryInput = {}) => {
  const engageMessage = new EngageMessages({
    kind: params.kind || 'manual',
    method: params.method || 'messenger',
    title: params.title || faker.random.word(),
    fromUserId: params.userId || faker.random.uuid(),
    segmentIds: params.segmentIds || [],
    brandIds: params.brandIds || [],
    tagIds: params.tagIds || [],
    isLive: params.isLive || false,
    isDraft: params.isDraft || false,
    messenger: params.messenger,
    email: params.email,
  });

  return engageMessage.save();
};

interface IBrandFactoryInput {
  code?: string;
  description?: string;
}

export const brandFactory = (params: IBrandFactoryInput = {}) => {
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

interface IEmailTemplateFactoryInput {
  content?: string;
}

export const emailTemplateFactory = (params: IEmailTemplateFactoryInput = {}) => {
  const emailTemplate = new EmailTemplates({
    name: faker.random.word(),
    content: params.content || faker.random.word(),
  });

  return emailTemplate.save();
};

interface IResponseTemplateFactoryInput {
  content?: string;
  brandId?: string;
}

export const responseTemplateFactory = (params: IResponseTemplateFactoryInput = {}) => {
  const responseTemplate = new ResponseTemplates({
    name: faker.random.word(),
    content: params.content || faker.random.word(),
    brandId: params.brandId || Random.id(),
    files: [faker.random.image()],
  });

  return responseTemplate.save();
};

interface IConditionsInput {
  field?: string;
  operator?: string;
  value?: string;
  dateUnit?: string;
  type?: string;
}

interface ISegmentFactoryInput {
  contentType?: string;
  description?: string;
  subOf?: string;
  color?: string;
  connector?: string;
  conditions?: IConditionsInput[];
}

export const segmentFactory = (params: ISegmentFactoryInput = {}) => {
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
    contentType: params.contentType || ACTIVITY_CONTENT_TYPES.CUSTOMER,
    name: faker.random.word(),
    description: params.description || faker.random.word(),
    subOf: params.subOf,
    color: params.color || '#809b87',
    connector: params.connector || 'any',
    conditions: params.conditions || defaultConditions,
  });

  return segment.save();
};

interface IInternalNoteFactoryInput {
  contentType?: string;
  contentTypeId?: string;
  content?: string;
  mentionedUserIds?: string[];
}

export const internalNoteFactory = (params: IInternalNoteFactoryInput) => {
  const internalNote = new InternalNotes({
    contentType: params.contentType || ACTIVITY_CONTENT_TYPES.CUSTOMER,
    contentTypeId: params.contentTypeId || faker.random.uuid().toString(),
    content: params.content || faker.random.word(),
  });

  return internalNote.save();
};

interface ICompanyFactoryInput {
  primaryName?: string;
  names?: string[];
  size?: number;
  industry?: string;
  website?: string;
  tagIds?: string[];
  plan?: string;
  leadStatus?: string;
  status?: string;
  lifecycleState?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  phones?: string[];
  emails?: string[];
  primaryPhone?: string;
  primaryEmail?: string;
}

export const companyFactory = (params: ICompanyFactoryInput = {}) => {
  const company = new Companies({
    primaryName: params.primaryName || faker.random.word(),
    names: params.names || [faker.random.word()],
    size: params.size || faker.random.number(),
    industry: params.industry || 'Airlines',
    website: params.website || faker.internet.domainName(),
    tagIds: params.tagIds || [faker.random.number()],
    plan: params.plan || faker.random.word(),
    leadStatus: params.leadStatus || 'open',
    status: params.status || STATUSES.ACTIVE,
    lifecycleState: params.lifecycleState || 'lead',
    createdAt: params.createdAt || new Date(),
    modifiedAt: params.modifiedAt || new Date(),
    phones: params.phones || [],
    emails: params.emails || [],
    primaryPhone: params.primaryPhone || '',
    primaryEmail: params.primaryEmail || '',
  });

  return company.save();
};

interface ICustomerFactoryInput {
  integrationId?: string;
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  emails?: string[];
  phones?: string[];
  doNotDisturb?: string;
  leadStatus?: string;
  status?: string;
  lifecycleState?: string;
  messengerData?: any;
  customFieldsData?: any;
  companyIds?: string[];
  tagIds?: string[];
  ownerId?: string;
  hasValidEmail?: boolean;
  profileScore?: number;
}

export const customerFactory = (params: ICustomerFactoryInput = {}, useModelMethod = false) => {
  const doc = {
    integrationId: params.integrationId,
    firstName: params.firstName || faker.random.word(),
    lastName: params.lastName || faker.random.word(),
    primaryEmail: params.primaryEmail || faker.internet.email(),
    primaryPhone: params.primaryPhone || faker.phone.phoneNumber(),
    emails: params.emails || [faker.internet.email()],
    phones: params.phones || [faker.phone.phoneNumber()],
    leadStatus: params.leadStatus || 'open',
    status: params.status || STATUSES.ACTIVE,
    lifecycleState: params.lifecycleState || 'lead',
    messengerData: params.messengerData || {},
    customFieldsData: params.customFieldsData || {},
    companyIds: params.companyIds || [faker.random.number(), faker.random.number()],
    tagIds: params.tagIds || [Random.id()],
    ownerId: params.ownerId || Random.id(),
    hasValidEmail: params.hasValidEmail || false,
    profileScore: params.profileScore || 0,
  };

  if (useModelMethod) {
    return Customers.createCustomer(doc);
  }

  const customer = new Customers(doc);

  return customer.save();
};

interface IFieldFactoryInput {
  contentType?: string;
  contentTypeId?: string;
  type?: string;
  validation?: string;
  text?: string;
  description?: string;
  isRequired?: boolean;
  order?: number;
  visible?: boolean;
  groupId?: string;
  isDefinedByErxes?: boolean;
  isVisible?: boolean;
  options?: string[];
}

export const fieldFactory = async (params: IFieldFactoryInput) => {
  const groupObj = await fieldGroupFactory({});

  if (!groupObj) {
    throw new Error('Failed to create fieldGroup');
  }

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
    groupId: params.groupId || (groupObj ? groupObj._id : ''),
  });

  await field.save();
  await Fields.updateOne({ _id: field._id }, { $set: { ...params } });

  return Fields.findOne({ _id: field._id });
};

interface IConversationFactoryInput {
  customerId?: string;
  assignedUserId?: string;
  integrationId?: string;
  userId?: string;
  content?: string;
  participatedUserIds?: string[];
  status?: string;
  closedAt?: dateType;
  closedUserId?: string;
  readUserIds?: string[];
  tagIds?: string[];
  messageCount?: number;
  number?: number;
  firstRespondedUserId?: string;
  firstRespondedDate?: dateType;
}

export const conversationFactory = (params: IConversationFactoryInput = {}) => {
  const doc = {
    content: params.content || faker.lorem.sentence(),
    customerId: params.customerId || Random.id(),
    integrationId: params.integrationId || Random.id(),
  };

  return Conversations.createConversation({
    ...doc,
    ...params,
  });
};

interface IConversationMessageFactoryInput {
  conversationId?: string;
  content?: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  customerId?: string;
  userId?: any;
  isCustomerRead?: boolean;
  engageData?: any;
  formWidgetData?: any;
}

export const conversationMessageFactory = async (params: IConversationMessageFactoryInput) => {
  let conversationId = params.conversationId;

  if (!conversationId) {
    const conversation = await conversationFactory({});
    conversationId = conversation._id;
  }

  let userId = params.userId;
  if (params.userId === undefined) {
    userId = Random.id();
  }

  return ConversationMessages.createMessage({
    content: params.content || faker.random.word(),
    attachments: {},
    mentionedUserIds: params.mentionedUserIds || [Random.id()],
    conversationId,
    internal: params.internal || true,
    customerId: params.customerId || Random.id(),
    userId,
    isCustomerRead: params.isCustomerRead || true,
    engageData: params.engageData || {},
    formWidgetData: params.formWidgetData || {},
  });
};

interface IIntegrationFactoryInput {
  name?: string;
  kind?: string;
  brandId?: string;
  formId?: string;
  formData?: any | string;
  tagIds?: string[];
}

export const integrationFactory = async (params: IIntegrationFactoryInput = {}) => {
  const kind = params.kind || 'messenger';

  const doc = {
    name: params.name || faker.random.word(),
    kind,
    brandId: params.brandId || Random.id(),
    formId: params.formId || Random.id(),
    messengerData: { welcomeMessage: 'welcome', notifyCustomer: true },
    formData: params.formData === 'form' ? params.formData : kind === 'form' ? { thankContent: 'thankContent' } : null,
    tagIds: params.tagIds || [],
  };

  return Integrations.create(doc);
};

interface IFormSubmission {
  customerId: string;
  submittedAt: Date;
}

interface IFormFactoryInput {
  title?: string;
  code?: string;
  description?: string;
  createdUserId?: string;
  submissions?: IFormSubmission[];
}

export const formFactory = async (params: IFormFactoryInput = {}) => {
  const { title, description, code, submissions, createdUserId } = params;

  return Forms.create({
    title: title || faker.random.word(),
    description: description || faker.random.word(),
    code: code || Random.id(),
    submissions: submissions || [],
    createdUserId: createdUserId || (await userFactory({})),
  });
};

interface INotificationConfigurationFactoryInput {
  isAllowed?: boolean;
  notifType?: string;
  user?: IUserDocument;
}

export const notificationConfigurationFactory = (params: INotificationConfigurationFactoryInput) => {
  let { isAllowed } = params;
  if (isAllowed == null) {
    isAllowed = true;
  }

  return NotificationConfigurations.create({
    notifType: params.notifType || NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
    // which module's type it is. For example: indocuments
    isAllowed,
    user: params.user || userFactory({}),
  });
};

interface INotificationFactoryInput {
  receiver?: any;
  notifType?: string;
  title?: string;
  content?: string;
  link?: string;
  createdUser?: any;
  requireRead?: boolean;
}

export const notificationFactory = async (params: INotificationFactoryInput) => {
  let receiver = params.receiver;

  if (!receiver) {
    receiver = await userFactory({});
  }

  return Notifications.create({
    notifType: params.notifType || NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
    title: params.title || 'new Notification title',
    content: params.content || 'new Notification content',
    link: params.link || 'new Notification link',
    receiver: receiver._id || faker.random.word(),
    createdUser: params.createdUser || faker.random.word(),
  });
};

interface IChannelFactoryInput {
  integrationIds?: string[];
  userId?: string;
  memberIds?: string[];
}

export const channelFactory = async (params: IChannelFactoryInput = {}) => {
  const user = await userFactory({});

  const obj = {
    name: faker.random.word(),
    description: faker.lorem.sentence,
    integrationIds: params.integrationIds || [],
    memberIds: params.userId || [user._id],
    userId: user._id,
    conversationCount: 0,
    openConversationCount: 0,
    createdAt: new Date(),
    ...params,
  };

  return Channels.create(obj);
};

interface IKnowledgeBaseTopicFactoryInput {
  userId?: string;
  categoryIds?: string[];
}

export const knowledgeBaseTopicFactory = async (params: IKnowledgeBaseTopicFactoryInput = {}) => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    brandId: faker.random.word(),
    catgoryIds: [faker.random.word()],
  };

  return KnowledgeBaseTopics.create({
    ...doc,
    ...params,
    userId: params.userId || faker.random.word(),
  });
};

interface IKnowledgeBaseCategoryFactoryInput {
  articleIds?: string[];
  userId?: string;
  topicIds?: string[];
}

export const knowledgeBaseCategoryFactory = async (params: IKnowledgeBaseCategoryFactoryInput = {}) => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    articleIds: params.articleIds || [faker.random.word(), faker.random.word()],
    icon: faker.random.word(),
  };

  return KnowledgeBaseCategories.createDoc({ ...doc, ...params }, params.userId || faker.random.word());
};

interface IKnowledgeBaseArticleCategoryInput {
  categoryIds?: string[];
  userId?: string;
}

export const knowledgeBaseArticleFactory = async (params: IKnowledgeBaseArticleCategoryInput = {}) => {
  const doc = {
    title: faker.random.word(),
    summary: faker.lorem.sentence,
    content: faker.lorem.sentence,
    icon: faker.random.word(),
  };

  return KnowledgeBaseArticles.createDoc({ ...doc, ...params }, params.userId || faker.random.word());
};

interface IBoardFactoryInput {
  type?: string;
}

export const boardFactory = (params: IBoardFactoryInput = {}) => {
  const board = new Boards({
    name: faker.random.word(),
    userId: Random.id(),
    type: params.type || BOARD_TYPES.DEAL,
  });

  return board.save();
};

interface IPipelineFactoryInput {
  boardId?: string;
  type?: string;
  bgColor?: string;
}

export const pipelineFactory = (params: IPipelineFactoryInput = {}) => {
  const pipeline = new Pipelines({
    name: faker.random.word(),
    boardId: params.boardId || faker.random.word(),
    type: params.type || BOARD_TYPES.DEAL,
    visibility: 'public',
    bgColor: params.bgColor || 'fff',
  });

  return pipeline.save();
};

interface IStageFactoryInput {
  pipelineId?: string;
  type?: string;
}

export const stageFactory = (params: IStageFactoryInput = {}) => {
  const stage = new Stages({
    name: faker.random.word(),
    pipelineId: params.pipelineId || faker.random.word(),
    type: params.type || BOARD_TYPES.DEAL,
  });

  return stage.save();
};

interface ITicketFactoryInput {
  stageId?: string;
  productsData?: any;
  closeDate?: Date;
  customerIds?: string[];
  companyIds?: string[];
  noCloseDate?: boolean;
  assignedUserIds?: string[];
}

export const dealFactory = (params: ITicketFactoryInput = {}) => {
  const deal = new Deals({
    ...params,
    name: faker.random.word(),
    stageId: params.stageId || faker.random.word(),
    companyIds: params.companyIds || [faker.random.word()],
    customerIds: params.customerIds || [faker.random.word()],
    amount: faker.random.objectElement(),
    ...(!params.noCloseDate ? { closeDate: params.closeDate || new Date() } : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds || [faker.random.word()],
  });

  return deal.save();
};

interface ITaskFactoryInput {
  stageId?: string;
  closeDate?: Date;
  customerIds?: string[];
  companyIds?: string[];
  noCloseDate?: boolean;
  assignedUserIds?: string[];
}

export const taskFactory = (params: ITaskFactoryInput = {}) => {
  const task = new Tasks({
    ...params,
    name: faker.random.word(),
    stageId: params.stageId || faker.random.word(),
    companyIds: params.companyIds || [faker.random.word()],
    customerIds: params.customerIds || [faker.random.word()],
    ...(!params.noCloseDate ? { closeDate: params.closeDate || new Date() } : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds || [faker.random.word()],
  });

  return task.save();
};

interface ITicketFactoryInput {
  stageId?: string;
  closeDate?: Date;
  customerIds?: string[];
  companyIds?: string[];
  noCloseDate?: boolean;
  assignedUserIds?: string[];
}

export const ticketFactory = (params: ITicketFactoryInput = {}) => {
  const ticket = new Tickets({
    ...params,
    name: faker.random.word(),
    stageId: params.stageId || faker.random.word(),
    companyIds: params.companyIds || [faker.random.word()],
    customerIds: params.customerIds || [faker.random.word()],
    ...(!params.noCloseDate ? { closeDate: params.closeDate || new Date() } : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds || [faker.random.word()],
  });

  return ticket.save();
};

interface IProductFactoryInput {
  name?: string;
  type?: string;
  description?: string;
}

export const productFactory = (params: IProductFactoryInput = {}) => {
  const product = new Products({
    name: params.name || faker.random.word(),
    type: params.type || PRODUCT_TYPES.PRODUCT,
    description: params.description || faker.random.word(),
    sku: faker.random.word(),
    createdAt: new Date(),
  });

  return product.save();
};

interface IConfigFactoryInput {
  code?: string;
  value?: string[];
}

export const configFactory = (params: IConfigFactoryInput = {}) => {
  const config = new Configs({
    ...params,
    code: faker.random.word(),
    value: [faker.random.word()],
  });

  return config.save();
};

interface IFieldGroupFactoryInput {
  contentType?: string;
  isDefinedByErxes?: boolean;
  isVisible?: boolean;
}

export const fieldGroupFactory = async (params: IFieldGroupFactoryInput) => {
  const doc = {
    name: faker.random.word(),
    contentType: params.contentType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
    description: faker.random.word(),
    isDefinedByErxes: params.isDefinedByErxes || false,
    order: 1,
    isVisible: true,
  };

  const groupObj = await FieldsGroups.create(doc);

  FieldsGroups.updateOne({ _id: groupObj._id }, { $set: { ...params } });

  return FieldsGroups.findOne({ _id: groupObj._id });
};

interface IImportHistoryFactoryInput {
  contentType?: string;
  failed?: number;
  total?: number;
  success?: string;
  ids?: string[];
}

export const importHistoryFactory = async (params: IImportHistoryFactoryInput) => {
  const user = await userFactory({});

  const doc = {
    failed: params.failed || faker.random.number(),
    total: params.total || faker.random.number(),
    success: params.success || faker.random.number(),
    ids: params.ids || [],
    contentType: params.contentType || 'customer',
  };

  return ImportHistory.create({ ...doc, ...params, userId: user._id });
};

interface IMessengerApp {
  name?: string;
  kind?: string;
  credentials: IMessengerAppCrendentials;
}

export function messengerAppFactory(params: IMessengerApp) {
  return MessengerApps.create({
    name: params.name || faker.random.word(),
    kind: params.kind || 'knowledgebase',
    credentials: params.credentials,
  });
}

interface IPermissionParams {
  module?: string;
  action?: string;
  allowed?: boolean;
  userId?: string;
  requiredActions?: string[];
  groupId?: string;
}

export const permissionFactory = async (params: IPermissionParams = {}) => {
  const permission = new Permissions({
    module: faker.random.word(),
    action: params.action || faker.random.word(),
    allowed: params.allowed || false,
    userId: params.userId || Random.id(),
    requiredActions: params.requiredActions || [],
    groupId: params.groupId || faker.random.word(),
  });

  return permission.save();
};

export const usersGroupFactory = () => {
  const usersGroup = new UsersGroups({
    name: faker.random.word(),
    description: faker.random.word(),
  });

  return usersGroup.save();
};
