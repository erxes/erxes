import { dateType } from 'aws-sdk/clients/sts'; // tslint:disable-line
import * as faker from 'faker';
import * as Random from 'meteor-random';
import * as momentTz from 'moment-timezone';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../data/constants';
import {
  ActivityLogs,
  Boards,
  Brands,
  CalendarBoards,
  CalendarGroups,
  Calendars,
  Channels,
  ChecklistItems,
  Checklists,
  Companies,
  Configs,
  Conformities,
  ConversationMessages,
  Conversations,
  Customers,
  DashboardItems,
  Dashboards,
  Deals,
  EmailDeliveries,
  EmailTemplates,
  EngageMessages,
  Fields,
  FieldsGroups,
  Forms,
  FormSubmissions,
  GrowthHacks,
  ImportHistory,
  Integrations,
  InternalNotes,
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  KnowledgeBaseTopics,
  MessengerApps,
  NotificationConfigurations,
  Notifications,
  OnboardingHistories,
  Permissions,
  PipelineLabels,
  Pipelines,
  ProductCategories,
  Products,
  ResponseTemplates,
  Scripts,
  Segments,
  Stages,
  Tags,
  Tasks,
  Tickets,
  Users,
  UsersGroups,
  Webhooks
} from './models';
import { ICustomField } from './models/definitions/common';
import {
  ACTIVITY_CONTENT_TYPES,
  BOARD_STATUSES,
  BOARD_TYPES,
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES,
  FORM_TYPES,
  MESSAGE_TYPES,
  NOTIFICATION_TYPES,
  PROBABILITY,
  PRODUCT_TYPES,
  WEBHOOK_ACTIONS
} from './models/definitions/constants';
import {
  IEmail,
  IMessenger,
  IScheduleDate
} from './models/definitions/engages';
import { IMessengerAppCrendentials } from './models/definitions/messengerApps';
import { IUserDocument } from './models/definitions/users';
import PipelineTemplates from './models/PipelineTemplates';

export const getUniqueValue = async (
  collection: any,
  fieldName: string = 'code',
  defaultValue?: string
) => {
  const getRandomValue = (type: string) =>
    type === 'email' ? faker.internet.email().toLowerCase() : Random.id();

  let uniqueValue = defaultValue || getRandomValue(fieldName);

  let duplicated = await collection.findOne({ [fieldName]: uniqueValue });

  while (duplicated) {
    uniqueValue = getRandomValue(fieldName);

    duplicated = await collection.findOne({ [fieldName]: uniqueValue });
  }

  return uniqueValue;
};

interface IActivityLogFactoryInput {
  contentType?: string;
  contentId?: string;
  action?: string;
  content?: any;
  createdBy?: string;
}

export const activityLogFactory = async (
  params: IActivityLogFactoryInput = {}
) => {
  const activity = new ActivityLogs({
    contentType: params.contentType || 'customer',
    action: params.action || 'create',
    contentId: params.contentId || faker.random.uuid(),
    content: params.content || 'content',
    createdBy: params.createdBy || faker.random.uuid()
  });

  return activity.save();
};

interface IDashboardFactoryInput {
  name?: string;
}

export const dashboardFactory = async (params: IDashboardFactoryInput) => {
  const dashboard = new Dashboards({
    name: params.name || 'name'
  });

  return dashboard.save();
};

interface IDashboardFactoryInput {
  dashboardId?: string;
  layout?: string;
  vizState?: string;
  name?: string;
  type?: string;
}

export const dashboardItemsFactory = async (params: IDashboardFactoryInput) => {
  const dashboardItem = new DashboardItems({
    name: params.name || 'name',
    dashboardId: params.dashboardId || 'dashboardId',
    layout: params.layout || 'layout',
    vizState: params.vizState || 'vizState',
    type: params.type || 'type'
  });

  return dashboardItem.save();
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
  brandIds?: string[];
  deviceTokens?: string[];
  registrationToken?: string;
  registrationTokenExpires?: Date;
  doNotDisturb?: string;
}

export const userFactory = async (params: IUserFactoryInput = {}) => {
  const user = new Users({
    username: params.username || faker.internet.userName(),
    details: {
      fullName: params.fullName || faker.random.word(),
      avatar: params.avatar || faker.image.imageUrl(),
      position: params.position || 'admin'
    },
    registrationToken: params.registrationToken,
    registrationTokenExpires: params.registrationTokenExpires,
    links: {
      twitter: params.twitter || faker.random.word(),
      facebook: params.facebook || faker.random.word(),
      linkedIn: params.linkedIn || faker.random.word(),
      youtube: params.youtube || faker.random.word(),
      github: params.github || faker.random.word(),
      website: params.website || faker.random.word()
    },
    email: await getUniqueValue(Users, 'email', params.email),
    password:
      params.password ||
      '$2a$10$qfBFBmWmUjeRcR.nBBfgDO/BEbxgoai5qQhyjsrDUMiZC6dG7sg1q',
    isOwner: typeof params.isOwner !== 'undefined' ? params.isOwner : true,
    isActive: typeof params.isActive !== 'undefined' ? params.isActive : true,
    groupIds: params.groupIds || [],
    brandIds: params.brandIds,
    deviceTokens: params.deviceTokens,
    doNotDisturb: params.doNotDisturb
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
    userId: Random.id()
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
  smsContent?: string;
  fromUserId?: string;
  fromIntegrationId?: string;
  scheduleDate?: IScheduleDate;
}

export const engageMessageFactory = (
  params: IEngageMessageFactoryInput = {}
) => {
  const engageMessage = new EngageMessages({
    kind: params.kind || 'manual',
    customerIds: params.customerIds || [],
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
    smsContent: {
      content: params.smsContent || 'Sms content',
      fromIntegrationId: params.fromIntegrationId
    },
    scheduleDate: params.scheduleDate || {
      type: 'day'
    }
  });

  return engageMessage.save();
};

interface IBrandFactoryInput {
  code?: string;
  name?: string;
  description?: string;
}

export const brandFactory = async (params: IBrandFactoryInput = {}) => {
  const brand = new Brands({
    name: params.name || faker.random.word(),
    code: await getUniqueValue(Brands, 'code', params.code),
    userId: Random.id(),
    description: params.description || faker.random.word(),
    createdAt: new Date(),
    emailConfig: {
      type: 'simple',
      template: faker.random.word()
    }
  });

  return brand.save();
};

interface ITemplateInput {
  stages?: any[];
}

export const pipelineTemplateFactory = (params: ITemplateInput = {}) => {
  const pipelineTemplate = new PipelineTemplates({
    name: faker.random.word(),
    description: faker.random.word(),
    type: BOARD_TYPES.GROWTH_HACK,
    stages: params.stages || [
      { name: faker.random.word(), formId: faker.random.word() },
      { name: faker.random.word(), formId: faker.random.word() }
    ]
  });

  return pipelineTemplate.save();
};

interface ILabelInput {
  name?: string;
  colorCode?: string;
  pipelineId?: string;
  type?: string;
  createdBy?: string;
}

export const pipelineLabelFactory = (params: ILabelInput = {}) => {
  const pipelineLabel = new PipelineLabels({
    name: params.name || faker.random.word(),
    colorCode: params.colorCode || faker.random.word(),
    pipelineId: params.pipelineId || faker.random.word(),
    type: params.type || BOARD_TYPES.DEAL,
    createdBy: params.createdBy || faker.random.uuid().toString()
  });

  return pipelineLabel.save();
};

interface IEmailTemplateFactoryInput {
  content?: string;
  customerId?: string;
}

export const emailTemplateFactory = (
  params: IEmailTemplateFactoryInput = {}
) => {
  const emailTemplate = new EmailTemplates({
    name: faker.random.word(),
    customerId: params.customerId || Random.id(),
    content: params.content || faker.random.word()
  });

  return emailTemplate.save();
};

interface IResponseTemplateFactoryInput {
  name?: string;
  content?: string;
  brandId?: string;
}

export const responseTemplateFactory = (
  params: IResponseTemplateFactoryInput = {}
) => {
  const responseTemplate = new ResponseTemplates({
    name: params.name || faker.random.word(),
    content: params.content || faker.random.word(),
    brandId: params.brandId || Random.id(),
    files: [faker.random.image()]
  });

  return responseTemplate.save();
};

interface IConditionsInput {
  field?: string;
  operator?: string;
  value?: any;
  type?: string;
}

interface ISegmentFactoryInput {
  contentType?: string;
  description?: string;
  subOf?: string;
  color?: string;
  conditions?: IConditionsInput[];
}

export const segmentFactory = (params: ISegmentFactoryInput = {}) => {
  const defaultConditions = [
    {
      field: 'messengerData.sessionCount',
      operator: 'e',
      value: '10',
      type: 'string'
    }
  ];

  const segment = new Segments({
    contentType: params.contentType || ACTIVITY_CONTENT_TYPES.CUSTOMER,
    name: faker.random.word(),
    description: params.description || faker.random.word(),
    subOf: params.subOf,
    color: params.color || '#809b87',
    conditions: params.conditions || defaultConditions
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
    content: params.content || faker.random.word()
  });

  return internalNote.save();
};

interface IChecklistFactoryInput {
  contentType?: string;
  contentTypeId?: string;
  title?: string;
  createdUserId?: string;
}

export const checklistFactory = (params: IChecklistFactoryInput) => {
  const checklist = new Checklists({
    contentType: params.contentType || ACTIVITY_CONTENT_TYPES.DEAL,
    contentTypeId: params.contentTypeId || faker.random.uuid().toString(),
    title: params.title || faker.random.uuid().toString(),
    createdUserId: params.createdUserId || faker.random.uuid().toString()
  });

  return checklist.save();
};

interface IChecklistItemFactoryInput {
  checklistId?: string;
  content?: string;
  isChecked?: boolean;
  createdUserId?: string;
  order?: number;
}

export const checklistItemFactory = (params: IChecklistItemFactoryInput) => {
  const checklistItem = new ChecklistItems({
    checklistId: params.checklistId || faker.random.uuid().toString,
    content: params.content || faker.random.uuid().toString,
    isChecked: params.isChecked || false,
    createdUserId: params.createdUserId || faker.random.uuid().toString(),
    order: params.order || 0
  });

  return checklistItem.save();
};

interface ICompanyFactoryInput {
  primaryName?: string;
  names?: string[];
  size?: number;
  industry?: string;
  website?: string;
  tagIds?: string[];
  scopeBrandIds?: string[];
  plan?: string;
  status?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  phones?: string[];
  emails?: string[];
  primaryPhone?: string;
  primaryEmail?: string;
  parentCompanyId?: string;
  ownerId?: string;
  mergedIds?: string[];
  code?: string;
}

export const companyFactory = (params: ICompanyFactoryInput = {}) => {
  const companyDoc = {
    primaryName: params.primaryName || faker.random.word(),
    names: params.names || [],
    size: params.size || faker.random.number(),
    industry: params.industry || 'Airlines',
    website: params.website || faker.internet.domainName(),
    tagIds: params.tagIds || [],
    plan: params.plan || faker.random.word(),
    status: params.status || 'Active',
    phones: params.phones || [],
    emails: params.emails || [],
    scopeBrandIds: params.scopeBrandIds || [],
    primaryPhone: params.primaryPhone || '',
    primaryEmail: params.primaryEmail || '',
    parentCompanyId: params.parentCompanyId || faker.random.uuid().toString(),
    ownerId: params.ownerId || faker.random.uuid().toString(),
    mergedIds: params.mergedIds || [],
    code: params.code || ''
  };

  const searchText = Companies.fillSearchText({ ...companyDoc });

  Object.assign(companyDoc, {
    createdAt: params.createdAt || new Date(),
    modifiedAt: params.modifiedAt || new Date(),
    searchText
  });

  const company = new Companies(companyDoc);

  return company.save();
};

interface ICustomerFactoryInput {
  integrationId?: string;
  firstName?: string;
  lastName?: string;
  sex?: number;
  birthDate?: Date;
  primaryEmail?: string;
  primaryPhone?: string;
  emails?: string[];
  phones?: string[];
  doNotDisturb?: string;
  leadStatus?: string;
  status?: string;
  customFieldsData?: any;
  trackedData?: any;
  tagIds?: string[];
  ownerId?: string;
  profileScore?: number;
  code?: string;
  isOnline?: boolean;
  lastSeenAt?: number;
  sessionCount?: number;
  visitorContactInfo?: any;
  deviceTokens?: string[];
  emailValidationStatus?: string;
  phoneValidationStatus?: string;
  mergedIds?: string[];
  relatedIntegrationIds?: string[];
  state?: 'visitor' | 'lead' | 'customer';
}

export const customerFactory = async (
  params: ICustomerFactoryInput = {},
  useModelMethod = false
) => {
  const createdAt = faker.date.past();

  const doc = {
    createdAt,
    integrationId: params.integrationId,
    firstName: params.firstName,
    lastName: params.lastName,
    sex: params.sex,
    birthDate: params.birthDate,
    primaryEmail: params.primaryEmail,
    primaryPhone: params.primaryPhone,
    emails: params.emails || [],
    phones: params.phones || [],
    leadStatus: params.leadStatus || 'new',
    status: params.status || 'Active',
    lastSeenAt: faker.date.between(createdAt, new Date()),
    isOnline: params.isOnline || false,
    sessionCount: faker.random.number(),
    customFieldsData: params.customFieldsData || [],
    trackedData: params.trackedData || [],
    tagIds: params.tagIds || [Random.id()],
    ownerId: params.ownerId || Random.id(),
    emailValidationStatus: params.emailValidationStatus || 'unknown',
    phoneValidationStatus: params.phoneValidationStatus || 'unknown',
    profileScore: params.profileScore || 0,
    code: await getUniqueValue(Customers, 'code', params.code),
    visitorContactInfo: params.visitorContactInfo,
    deviceTokens: params.deviceTokens || [],
    mergedIds: params.mergedIds || [],
    relatedIntegrationIds: params.relatedIntegrationIds || [],
    state: params.state
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

  return Fields.create({
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
    isDefinedByErxes: params.isDefinedByErxes
  });
};

interface IConversationFactoryInput {
  customerId?: string;
  assignedUserId?: string;
  integrationId?: string;
  operatorStatus?: string;
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
  isCustomerRespondedLast?: boolean;
}

export const conversationFactory = (params: IConversationFactoryInput = {}) => {
  const doc = {
    content: params.content || faker.random.word(),
    customerId: params.customerId || Random.id(),
    integrationId: params.integrationId || Random.id(),
    status: params.status || CONVERSATION_STATUSES.NEW,
    operatorStatus:
      params.operatorStatus || CONVERSATION_OPERATOR_STATUS.OPERATOR
  };

  return Conversations.createConversation({
    ...doc,
    ...params
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
  kind?: string;
  contentType?: string;
}

export const conversationMessageFactory = async (
  params: IConversationMessageFactoryInput
) => {
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
    content: params.content,
    attachments: [],
    mentionedUserIds: params.mentionedUserIds || [Random.id()],
    conversationId,
    internal:
      params.internal === undefined || params.internal === null
        ? true
        : params.internal,
    customerId: params.customerId || Random.id(),
    userId,
    isCustomerRead: params.isCustomerRead,
    engageData: params.engageData || {},
    formWidgetData: params.formWidgetData || {},
    contentType: params.contentType || MESSAGE_TYPES.TEXT
  });
};

interface IIntegrationFactoryInput {
  name?: string;
  kind?: string;
  brandId?: string;
  formId?: string;
  leadData?: any;
  tagIds?: string[];
  isActive?: boolean;
  messengerData?: any;
  languageCode?: string;
}

export const integrationFactory = async (
  params: IIntegrationFactoryInput = {}
) => {
  const kind = params.kind || 'messenger';

  const doc = {
    name: params.name || faker.random.word(),
    kind,
    languageCode: params.languageCode,
    brandId: params.brandId || faker.random.uuid().toString(),
    formId: params.formId,
    messengerData: params.messengerData,
    leadData: params.leadData
      ? params.leadData
      : { thankContent: 'thankContent' },
    tagIds: params.tagIds,
    isActive:
      params.isActive === undefined || params.isActive === null
        ? true
        : params.isActive
  };

  if (params.messengerData && !params.messengerData.timezone) {
    doc.messengerData.timezone = momentTz.tz.guess(true);
  }

  const user = await userFactory({});

  return Integrations.createIntegration(doc, user._id);
};

interface IFormFactoryInput {
  title?: string;
  code?: string;
  type?: string;
  description?: string;
  createdUserId?: string;
}

export const formFactory = async (params: IFormFactoryInput = {}) => {
  const { title, description, code, type, createdUserId } = params;

  return Forms.create({
    title: title || faker.random.word(),
    description: description || faker.random.word(),
    code: await getUniqueValue(Forms, 'code', code),
    type: type || FORM_TYPES.GROWTH_HACK,
    createdUserId: createdUserId || (await userFactory({}))
  });
};

interface IFormSubmissionFactoryInput {
  customerId?: string;
  formId?: string;
  contentType?: string;
  contentTypeId?: string;
  formFieldId?: string;
  value?: string;
}

export const formSubmissionFactory = async (
  params: IFormSubmissionFactoryInput = {}
) => {
  return FormSubmissions.create({
    submittedAt: new Date(),
    customerId: params.customerId || faker.random.word(),
    contentType: params.contentType,
    contentTypeId: params.contentTypeId,
    formId: params.formId || faker.random.word(),
    formFieldId: params.formFieldId,
    value: params.value
  });
};

interface INotificationConfigurationFactoryInput {
  isAllowed?: boolean;
  notifType?: string;
  user?: IUserDocument;
}

export const notificationConfigurationFactory = (
  params: INotificationConfigurationFactoryInput
) => {
  let { isAllowed } = params;
  if (isAllowed == null) {
    isAllowed = true;
  }

  return NotificationConfigurations.create({
    notifType: params.notifType || NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
    // which module's type it is. For example: indocuments
    isAllowed,
    user: params.user || userFactory({})
  });
};

interface INotificationFactoryInput {
  receiver?: any;
  notifType?: string;
  title?: string;
  content?: string;
  link?: string;
  createdUser?: any;
  isRead?: boolean;
  contentTypeId?: string;
  contentType?: string;
}

export const notificationFactory = async (
  params: INotificationFactoryInput
) => {
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
    isRead: params.isRead || false,
    contentTypeId: params.contentTypeId,
    contentType: params.contentType
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
    integrationIds: params.integrationIds,
    memberIds: params.userId || [user._id],
    userId: user._id,
    conversationCount: 0,
    openConversationCount: 0,
    createdAt: new Date(),
    ...params
  };

  return Channels.create(obj);
};

interface IKnowledgeBaseTopicFactoryInput {
  userId?: string;
  color?: string;
  categoryIds?: string[];
  brandId?: string;
}

export const knowledgeBaseTopicFactory = async (
  params: IKnowledgeBaseTopicFactoryInput = {}
) => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    brandId: params.brandId || faker.random.word(),
    color: params.color
  };

  return KnowledgeBaseTopics.createDoc(
    {
      ...doc,
      ...params
    },
    params.userId || faker.random.word()
  );
};

interface IKnowledgeBaseCategoryFactoryInput {
  articleIds?: string[];
  userId?: string;
  topicIds?: string[];
}

export const knowledgeBaseCategoryFactory = async (
  params: IKnowledgeBaseCategoryFactoryInput = {}
) => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    articleIds: params.articleIds,
    icon: faker.random.word()
  };

  return KnowledgeBaseCategories.createDoc(
    { ...doc, ...params },
    params.userId || faker.random.word()
  );
};

interface IKnowledgeBaseArticleCategoryInput {
  categoryIds?: string[];
  userId?: string;
  reactionChoices?: string[];
  status?: string;
  modifiedBy?: string;
}

export const knowledgeBaseArticleFactory = async (
  params: IKnowledgeBaseArticleCategoryInput = {}
) => {
  const doc = {
    title: faker.random.word(),
    summary: faker.lorem.sentence,
    content: faker.lorem.sentence,
    icon: faker.random.word(),
    reactionChoices: params.reactionChoices || ['wow'],
    status: params.status || 'draft',
    modifiedBy: params.modifiedBy
  };

  return KnowledgeBaseArticles.createDoc(
    { ...doc, ...params },
    params.userId || faker.random.word()
  );
};

interface IBoardFactoryInput {
  name?: string;
  type?: string;
}

export const boardFactory = (params: IBoardFactoryInput = {}) => {
  const board = new Boards({
    name: params.name || faker.random.word(),
    userId: Random.id(),
    type: params.type || BOARD_TYPES.DEAL
  });

  return board.save();
};

interface IPipelineFactoryInput {
  boardId?: string;
  type?: string;
  bgColor?: string;
  hackScoringType?: string;
  visibility?: string;
  memberIds?: string[];
  watchedUserIds?: string[];
  startDate?: Date;
  endDate?: Date;
  templateId?: string;
}

export const pipelineFactory = async (params: IPipelineFactoryInput = {}) => {
  const type = params.type || BOARD_TYPES.DEAL;
  let boardId = params.boardId;

  if (!boardId) {
    const board = await boardFactory({ type });

    boardId = board._id;
  }

  return Pipelines.create({
    name: faker.random.word(),
    boardId,
    type,
    visibility: params.visibility || 'public',
    bgColor: params.bgColor || 'fff',
    hackScoringType: params.hackScoringType,
    memberIds: params.memberIds,
    watchedUserIds: params.watchedUserIds,
    startDate: params.startDate,
    endDate: params.endDate,
    templateId: params.templateId
  });
};

interface IStageFactoryInput {
  pipelineId?: string;
  type?: string;
  probability?: string;
  formId?: string;
  status?: string;
  order?: number;
}

export const stageFactory = async (params: IStageFactoryInput = {}) => {
  const type = params.type || BOARD_TYPES.DEAL;

  const board = await boardFactory({ type });
  const pipeline = await pipelineFactory({ type, boardId: board._id });

  const stage = new Stages({
    name: faker.random.word(),
    pipelineId: params.pipelineId || pipeline._id,
    type: params.type || BOARD_TYPES.DEAL,
    probability: params.probability || PROBABILITY.TEN,
    formId: params.formId,
    order: params.order,
    status: params.status || BOARD_STATUSES.ACTIVE
  });

  return stage.save();
};

interface IDealFactoryInput {
  name?: string;
  stageId?: string;
  productsData?: any;
  closeDate?: Date;
  noCloseDate?: boolean;
  assignedUserIds?: string[];
  watchedUserIds?: string[];
  labelIds?: string[];
  modifiedBy?: string;
  order?: number;
  probability?: string;
  searchText?: string;
  userId?: string;
  initialStageId?: string;
  sourceConversationId?: string;
}

export const dealFactory = async (params: IDealFactoryInput = {}) => {
  const board = await boardFactory({ type: BOARD_TYPES.DEAL });
  const pipeline = await pipelineFactory({ boardId: board._id });
  const stage = await stageFactory({ pipelineId: pipeline._id });

  const stageId = params.stageId || stage._id;

  const deal = new Deals({
    ...params,
    initialStageId: stageId,
    name: params.name || faker.random.word(),
    stageId,
    amount: faker.random.objectElement(),
    ...(!params.noCloseDate
      ? { closeDate: params.closeDate || new Date() }
      : {}),
    description: faker.random.word(),
    productsData: params.productsData,
    assignedUserIds: params.assignedUserIds || [faker.random.word()],
    userId: params.userId || faker.random.word(),
    watchedUserIds: params.watchedUserIds,
    labelIds: params.labelIds || [],
    order: params.order,
    probability: params.probability,
    searchText: params.searchText,
    sourceConversationId: params.sourceConversationId,
    createdAt: new Date()
  });

  return deal.save();
};

interface ITaskFactoryInput {
  name?: string;
  stageId?: string;
  closeDate?: Date;
  noCloseDate?: boolean;
  assignedUserIds?: string[];
  priority?: string;
  watchedUserIds?: string[];
  labelIds?: string[];
  sourceConversationId?: string;
  initialStageId?: string;
}

const attachmentFactory = () => ({
  name: faker.random.word(),
  url: faker.image.imageUrl(),
  type: faker.system.mimeType(),
  size: faker.random.number()
});

export const taskFactory = async (params: ITaskFactoryInput = {}) => {
  const board = await boardFactory({ type: BOARD_TYPES.TASK });
  const pipeline = await pipelineFactory({
    boardId: board._id,
    type: BOARD_TYPES.TASK
  });
  const stage = await stageFactory({
    pipelineId: pipeline._id,
    type: BOARD_TYPES.TASK
  });

  const task = new Tasks({
    ...params,
    name: params.name || faker.random.word(),
    stageId: params.stageId || stage._id,
    ...(!params.noCloseDate
      ? { closeDate: params.closeDate || new Date() }
      : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds,
    priority: params.priority,
    watchedUserIds: params.watchedUserIds,
    labelIds: params.labelIds || [],
    sourceConversationId: params.sourceConversationId,
    attachments: [attachmentFactory(), attachmentFactory()]
  });

  return task.save();
};

interface ITicketFactoryInput {
  name?: string;
  stageId?: string;
  closeDate?: Date;
  noCloseDate?: boolean;
  assignedUserIds?: string[];
  priority?: string;
  source?: string;
  watchedUserIds?: string[];
  labelIds?: string[];
  sourceConversationId?: string;
}

export const ticketFactory = async (params: ITicketFactoryInput = {}) => {
  const board = await boardFactory({ type: BOARD_TYPES.TICKET });
  const pipeline = await pipelineFactory({
    boardId: board._id,
    type: BOARD_TYPES.TICKET
  });
  const stage = await stageFactory({
    pipelineId: pipeline._id,
    type: BOARD_TYPES.TICKET
  });

  const ticket = new Tickets({
    ...params,
    name: params.name || faker.random.word(),
    stageId: params.stageId || stage._id,
    ...(!params.noCloseDate
      ? { closeDate: params.closeDate || new Date() }
      : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds,
    priority: params.priority,
    source: params.source,
    watchedUserIds: params.watchedUserIds,
    labelIds: params.labelIds || [],
    sourceConversationId: params.sourceConversationId
  });

  return ticket.save();
};

interface IGrowthHackFactoryInput {
  name?: string;
  stageId?: string;
  closeDate?: Date;
  customerIds?: string[];
  companyIds?: string[];
  noCloseDate?: boolean;
  assignedUserIds?: string[];
  watchedUserIds?: string[];
  hackStages?: string[];
  priority?: string;
  ease?: number;
  impact?: number;
  votedUserIds?: string[];
  labelIds?: string[];
  initialStageId?: string;
  order?: number;
}

export const growthHackFactory = async (
  params: IGrowthHackFactoryInput = {}
) => {
  const board = await boardFactory({ type: BOARD_TYPES.GROWTH_HACK });
  const pipeline = await pipelineFactory({ boardId: board._id });
  const stage = await stageFactory({ pipelineId: pipeline._id });

  const growthHack = new GrowthHacks({
    ...params,
    name: params.name || faker.random.word(),
    stageId: params.stageId || stage._id,
    companyIds: params.companyIds || [faker.random.word()],
    customerIds: params.customerIds || [faker.random.word()],
    ...(!params.noCloseDate
      ? { closeDate: params.closeDate || new Date() }
      : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds || [faker.random.word()],
    hackStages: params.hackStages || [faker.random.word()],
    votedUserIds: params.votedUserIds || [faker.random.uuid().toString()],
    watchedUserIds: params.watchedUserIds,
    ease: params.ease || 0,
    impact: params.impact || 0,
    priority: params.priority,
    labelIds: params.labelIds || [],
    order: params.order || Math.random()
  });

  return growthHack.save();
};

interface IProductFactoryInput {
  name?: string;
  type?: string;
  description?: string;
  tagIds?: string[];
  categoryId?: string;
  customFieldsData?: ICustomField[];
}

export const productFactory = async (params: IProductFactoryInput = {}) => {
  const product = new Products({
    name: params.name || faker.random.word(),
    categoryId: params.categoryId || faker.random.word(),
    type: params.type || PRODUCT_TYPES.PRODUCT,
    customFieldsData: params.customFieldsData,
    description: params.description || faker.random.word(),
    sku: faker.random.word(),
    code: await getUniqueValue(Products, 'code'),
    createdAt: new Date(),
    tagIds: params.tagIds || []
  });

  return product.save();
};

interface IProductCategoryFactoryInput {
  name?: string;
  description?: string;
  parentId?: string;
  code?: string;
  order?: string;
}

export const productCategoryFactory = async (
  params: IProductCategoryFactoryInput = {}
) => {
  const productCategory = new ProductCategories({
    name: params.name || faker.random.word(),
    description: params.description || faker.random.word(),
    parentId: params.parentId,
    code: await getUniqueValue(ProductCategories, 'code', params.code),
    order: params.order || faker.random.word(),
    createdAt: new Date()
  });

  return productCategory.save();
};

interface IConfigFactoryInput {
  code?: string;
  value?: string[];
}

export const configFactory = async (params: IConfigFactoryInput = {}) => {
  const config = new Configs({
    ...params,
    code: await getUniqueValue(Configs, 'code', params.code),
    value: [faker.random.word()]
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
    isVisible: true
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
  errorMsgs?: string[];
  ids?: string[];
}

export const importHistoryFactory = async (
  params: IImportHistoryFactoryInput
) => {
  const user = await userFactory({});

  const doc = {
    failed: params.failed || faker.random.number(),
    total: params.total || faker.random.number(),
    success: params.success || faker.random.number(),
    ids: params.ids,
    contentType: params.contentType || 'customer',
    errorMsgs: params.errorMsgs
  };

  return ImportHistory.create({ ...doc, ...params, userId: user._id });
};

interface IMessengerApp {
  name?: string;
  kind?: string;
  credentials?: IMessengerAppCrendentials;
}

export function messengerAppFactory(params: IMessengerApp) {
  return MessengerApps.create({
    name: params.name || faker.random.word(),
    kind: params.kind,
    credentials: params.credentials
  });
}

interface IScript {
  name?: string;
  messengerId?: string;
  messengerBrandCode?: string;
  leadIds?: string[];
  leadMaps?: Array<{ formCode: string; brandCode: string }>;
  kbTopicId?: string;
}

export function scriptFactory(params: IScript) {
  return Scripts.create({
    name: params.name || faker.random.word(),
    messengerId: params.messengerId,
    messengerBrandCode: params.messengerBrandCode,
    leadIds: params.leadIds,
    leadMaps: params.leadMaps,
    kbTopicId: params.kbTopicId
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
    module: params.module || faker.random.word(),
    action: params.action || faker.random.word(),
    allowed: typeof params.allowed === 'undefined' ? true : params.allowed,
    userId: params.userId,
    requiredActions: params.requiredActions || [],
    groupId: params.groupId
  });

  return permission.save();
};

interface IUserGroupParams {
  isVisible?: boolean;
}

export const usersGroupFactory = async (params: IUserGroupParams = {}) => {
  const usersGroup = new UsersGroups({
    name: await getUniqueValue(UsersGroups, 'name'),
    description: faker.random.word(),
    isVisible:
      params.isVisible === undefined || params.isVisible === null
        ? true
        : params.isVisible
  });

  return usersGroup.save();
};

interface IConformityFactoryInput {
  mainType: string;
  mainTypeId: string;
  relType: string;
  relTypeId: string;
}

export const conformityFactory = (params: IConformityFactoryInput) => {
  return Conformities.addConformity(params);
};

interface IEmailDeliveryFactoryInput {
  attachments?: string[];
  subject?: string;
  status?: string;
  body?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  from?: string;
  kind?: string;
  userId?: string;
  customerId?: string;
}

export const emailDeliveryFactory = async (
  params: IEmailDeliveryFactoryInput = {}
) => {
  const emailDelviry = new EmailDeliveries({
    attachments: params.attachments || [],
    subject: params.subject || 'subject',
    status: params.status || 'pending',
    body: params.body || 'body',
    to: params.to || ['to'],
    cc: params.cc || ['cc'],
    bcc: params.bcc || ['bcc'],
    from: params.from || 'from',
    kind: params.kind || 'kind',
    userId: params.userId || faker.random.uuid(),
    customerId: params.customerId || faker.random.uuid()
  });

  return emailDelviry.save();
};

interface IMessageEngageDataParams {
  messageId?: string;
  brandId?: string;
  content?: string;
  fromUserId?: string;
  kind?: string;
  sentAs?: string;
}

export function engageDataFactory(params: IMessageEngageDataParams) {
  return {
    messageId: params.messageId || Random.id(),
    brandId: params.brandId || Random.id(),
    content: params.content || faker.lorem.sentence(),
    fromUserId: params.fromUserId || Random.id(),
    kind: params.kind || 'popup',
    sentAs: params.sentAs || 'post'
  };
}

interface IWebhookActionInput {
  label?: string;
  type?: string;
  action?: any;
}

interface IWebhookParams {
  url?: string;
  actions?: IWebhookActionInput[];
  token?: string;
}

export function webhookFactory(params: IWebhookParams) {
  const webhook = new Webhooks({
    url: params.url || `https://${faker.random.uuid()}.com`,
    actions: params.actions || WEBHOOK_ACTIONS,
    token: params.token || faker.random.uuid()
  });

  return webhook.save();
}

interface IOnboardHistoryParams {
  userId: string;
  isCompleted?: boolean;
  completedSteps?: string[];
}

export const onboardHistoryFactory = async (params: IOnboardHistoryParams) => {
  const onboard = new OnboardingHistories(params);

  return onboard.save();
};

interface ICalendarFactoryInput {
  name?: string;
  color?: string;
  userId?: string;
  groupId: string;
  createdAt?: Date;
  accountId?: string;
}

export const calendarFactory = async (params: ICalendarFactoryInput) => {
  const calendar = new Calendars({
    name: params.name || faker.random.word(),
    categoryId: params.color || faker.random.word(),
    userId: params.userId || PRODUCT_TYPES.PRODUCT,
    groupId: params.groupId,
    accountId: params.accountId || 'erxesApiId'
  });

  return calendar.save();
};

interface ICalendarBoardFactoryInput {
  name?: string;
}

export const calendarBoardFactory = async (
  params: ICalendarBoardFactoryInput = {}
) => {
  const calendarBoard = new CalendarBoards({
    name: params.name || faker.random.word()
  });

  return calendarBoard.save();
};
interface ICalendarGroupFactoryInput {
  name?: string;
  isPrivate?: boolean;
  userId?: string;
  memberIds?: string[];
  boardId?: string;
}

export const calendarGroupFactory = async (
  params: ICalendarGroupFactoryInput = {}
) => {
  const calendarGroup = new CalendarGroups({
    name: params.name || faker.random.word(),
    isPrivate: params.isPrivate || false,
    userId: params.userId || faker.random.word(),
    memberIds: params.memberIds || [faker.random.word()],
    boardId: params.boardId || (await calendarBoardFactory())._id
  });

  return calendarGroup.save();
};
