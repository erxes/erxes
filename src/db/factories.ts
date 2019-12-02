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
  ChecklistItems,
  Checklists,
  Companies,
  Configs,
  Conformities,
  ConversationMessages,
  Conversations,
  Customers,
  Deals,
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
} from './models';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  BOARD_TYPES,
  CONVERSATION_STATUSES,
  FORM_TYPES,
  NOTIFICATION_TYPES,
  PROBABILITY,
  PRODUCT_TYPES,
  STATUSES,
} from './models/definitions/constants';
import { IEmail, IMessenger } from './models/definitions/engages';
import { IMessengerAppCrendentials } from './models/definitions/messengerApps';
import { IUserDocument } from './models/definitions/users';
import PipelineTemplates from './models/PipelineTemplates';

const getUniqueValue = async (collection: any, fieldName: string = 'code', defaultValue?: string) => {
  const getRandomValue = (type: string) => (type === 'email' ? faker.internet.email() : faker.random.word());

  let uniqueValue = defaultValue || getRandomValue(fieldName);

  let duplicated = await collection.findOne({ [fieldName]: uniqueValue });

  while (duplicated) {
    uniqueValue = getRandomValue(fieldName);

    duplicated = await collection.findOne({ [fieldName]: uniqueValue });
  }

  return uniqueValue;
};

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
    email: await getUniqueValue(Users, 'email', params.email),
    password: params.password || '$2a$10$qfBFBmWmUjeRcR.nBBfgDO/BEbxgoai5qQhyjsrDUMiZC6dG7sg1q',
    isOwner: typeof params.isOwner !== 'undefined' ? params.isOwner : true,
    isActive: typeof params.isActive !== 'undefined' ? params.isActive : true,
    groupIds: params.groupIds || [],
    brandIds: params.brandIds,
    deviceTokens: params.deviceTokens,
    doNotDisturb: params.doNotDisturb,
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
      template: faker.random.word(),
    },
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
      { name: faker.random.word(), formId: faker.random.word() },
    ],
  });

  return pipelineTemplate.save();
};

interface ILabelInput {
  name?: string;
  colorCode?: string;
  pipelineId?: string;
  type?: string;
}

export const pipelineLabelFactory = (params: ILabelInput = {}) => {
  const pipelineLabel = new PipelineLabels({
    name: params.name || faker.random.word(),
    colorCode: params.colorCode || faker.random.word(),
    pipelineId: params.pipelineId || faker.random.word(),
    type: params.type || BOARD_TYPES.DEAL,
  });

  return pipelineLabel.save();
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
  name?: string;
  content?: string;
  brandId?: string;
}

export const responseTemplateFactory = (params: IResponseTemplateFactoryInput = {}) => {
  const responseTemplate = new ResponseTemplates({
    name: params.name || faker.random.word(),
    content: params.content || faker.random.word(),
    brandId: params.brandId || Random.id(),
    files: [faker.random.image()],
  });

  return responseTemplate.save();
};

interface IConditionsInput {
  field?: string;
  operator?: string;
  value?: any;
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

interface IChecklistFactoryInput {
  contentType?: string;
  contentTypeId?: string;
  title?: string;
}

export const checklistFactory = (params: IChecklistFactoryInput) => {
  const checklist = new Checklists({
    contentType: params.contentType || ACTIVITY_CONTENT_TYPES.DEAL,
    contentTypeId: params.contentTypeId || faker.random.uuid().toString(),
    title: params.title || faker.random.uuid().toString(),
  });

  return checklist.save();
};

interface IChecklistItemFactoryInput {
  checklistId?: string;
  content?: string;
  isChecked?: boolean;
}

export const checklistItemFactory = (params: IChecklistItemFactoryInput) => {
  const checklistItem = new ChecklistItems({
    checklistId: params.checklistId || faker.random.uuid().toString,
    content: params.content || faker.random.uuid().toString,
    isChecked: params.isChecked || false,
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
  const companyDoc = {
    primaryName: params.primaryName || faker.random.word(),
    names: params.names || [],
    size: params.size || faker.random.number(),
    industry: params.industry || 'Airlines',
    website: params.website || faker.internet.domainName(),
    tagIds: params.tagIds || [],
    plan: params.plan || faker.random.word(),
    leadStatus: params.leadStatus || 'open',
    status: params.status || STATUSES.ACTIVE,
    lifecycleState: params.lifecycleState || 'lead',
    phones: params.phones || [],
    emails: params.emails || [],
    scopeBrandIds: params.scopeBrandIds || [],
    primaryPhone: params.primaryPhone || '',
    primaryEmail: params.primaryEmail || '',
  };

  const searchText = Companies.fillSearchText({ ...companyDoc });

  Object.assign(companyDoc, {
    createdAt: params.createdAt || new Date(),
    modifiedAt: params.modifiedAt || new Date(),
    searchText,
  });

  const company = new Companies(companyDoc);

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
  tagIds?: string[];
  ownerId?: string;
  hasValidEmail?: boolean;
  profileScore?: number;
  code?: string;
  visitorContactInfo?: any;
}

export const customerFactory = async (params: ICustomerFactoryInput = {}, useModelMethod = false) => {
  const doc = {
    integrationId: params.integrationId,
    firstName: params.firstName,
    lastName: params.lastName,
    primaryEmail: params.primaryEmail,
    primaryPhone: params.primaryPhone,
    emails: params.emails || [],
    phones: params.phones || [],
    leadStatus: params.leadStatus || 'open',
    status: params.status || STATUSES.ACTIVE,
    lifecycleState: params.lifecycleState || 'lead',
    messengerData: params.messengerData,
    customFieldsData: params.customFieldsData || {},
    tagIds: params.tagIds || [Random.id()],
    ownerId: params.ownerId || Random.id(),
    hasValidEmail: params.hasValidEmail || false,
    profileScore: params.profileScore || 0,
    code: await getUniqueValue(Customers, 'code', params.code),
    visitorContactInfo: params.visitorContactInfo,
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
    isDefinedByErxes: params.isDefinedByErxes,
  });
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
    content: params.content || faker.random.word(),
    customerId: params.customerId || Random.id(),
    integrationId: params.integrationId || Random.id(),
    status: params.status || CONVERSATION_STATUSES.NEW,
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
  kind?: string;
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
    content: params.content,
    attachments: {},
    mentionedUserIds: params.mentionedUserIds || [Random.id()],
    conversationId,
    internal: params.internal === undefined || params.internal === null ? true : params.internal,
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
  leadData?: any | string;
  tagIds?: string[];
  isActive?: boolean;
  messengerData?: object;
}

export const integrationFactory = async (params: IIntegrationFactoryInput = {}) => {
  const kind = params.kind || 'messenger';

  const doc = {
    name: params.name || faker.random.word(),
    kind,
    brandId: params.brandId,
    formId: params.formId,
    messengerData: params.messengerData,
    leadData: params.leadData === 'lead' ? params.leadData : kind === 'lead' ? { thankContent: 'thankContent' } : null,
    tagIds: params.tagIds,
    isActive: params.isActive === undefined || params.isActive === null ? true : params.isActive,
  };

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
    createdUserId: createdUserId || (await userFactory({})),
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

export const formSubmissionFactory = async (params: IFormSubmissionFactoryInput = {}) => {
  return FormSubmissions.create({
    submittedAt: new Date(),
    customerId: params.customerId || faker.random.word(),
    contentType: params.contentType,
    contentTypeId: params.contentTypeId,
    formId: params.formId || faker.random.word(),
    formFieldId: params.formFieldId,
    value: params.value,
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
  isRead?: boolean;
  contentTypeId?: string;
  contentType?: string;
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
    isRead: params.isRead || false,
    contentTypeId: params.contentTypeId,
    contentType: params.contentType,
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
    ...params,
  };

  return Channels.create(obj);
};

interface IKnowledgeBaseTopicFactoryInput {
  userId?: string;
  color?: string;
  categoryIds?: string[];
}

export const knowledgeBaseTopicFactory = async (params: IKnowledgeBaseTopicFactoryInput = {}) => {
  const doc = {
    title: faker.random.word(),
    description: faker.lorem.sentence,
    brandId: faker.random.word(),
    color: params.color,
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
    articleIds: params.articleIds,
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
  const board = await boardFactory({ type });

  return Pipelines.create({
    name: faker.random.word(),
    boardId: params.boardId || board._id,
    type,
    visibility: params.visibility || 'public',
    bgColor: params.bgColor || 'fff',
    hackScoringType: params.hackScoringType,
    memberIds: params.memberIds,
    watchedUserIds: params.watchedUserIds,
    startDate: params.startDate,
    endDate: params.endDate,
    templateId: params.templateId,
  });
};

interface IStageFactoryInput {
  pipelineId?: string;
  type?: string;
  probability?: string;
  formId?: string;
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
  });

  return stage.save();
};

interface IDealFactoryInput {
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
}

export const dealFactory = async (params: IDealFactoryInput = {}) => {
  const board = await boardFactory({ type: BOARD_TYPES.DEAL });
  const pipeline = await pipelineFactory({ boardId: board._id });
  const stage = await stageFactory({ pipelineId: pipeline._id });

  const stageId = params.stageId || stage._id;

  const deal = new Deals({
    ...params,
    initialStageId: stageId,
    name: faker.random.word(),
    stageId,
    amount: faker.random.objectElement(),
    ...(!params.noCloseDate ? { closeDate: params.closeDate || new Date() } : {}),
    description: faker.random.word(),
    productsDate: params.productsData,
    assignedUserIds: params.assignedUserIds || [faker.random.word()],
    watchedUserIds: params.watchedUserIds,
    labelIds: params.labelIds || [],
    order: params.order,
    probability: params.probability,
    searchText: params.searchText,
  });

  return deal.save();
};

interface ITaskFactoryInput {
  stageId?: string;
  closeDate?: Date;
  noCloseDate?: boolean;
  assignedUserIds?: string[];
  priority?: string;
  watchedUserIds?: string[];
  labelIds?: string[];
}

export const taskFactory = async (params: ITaskFactoryInput = {}) => {
  const board = await boardFactory({ type: BOARD_TYPES.TASK });
  const pipeline = await pipelineFactory({ boardId: board._id, type: BOARD_TYPES.TASK });
  const stage = await stageFactory({ pipelineId: pipeline._id, type: BOARD_TYPES.TASK });

  const task = new Tasks({
    ...params,
    name: faker.random.word(),
    stageId: params.stageId || stage._id,
    ...(!params.noCloseDate ? { closeDate: params.closeDate || new Date() } : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds,
    priority: params.priority,
    watchedUserIds: params.watchedUserIds,
    labelIds: params.labelIds || [],
  });

  return task.save();
};

interface ITicketFactoryInput {
  stageId?: string;
  closeDate?: Date;
  noCloseDate?: boolean;
  assignedUserIds?: string[];
  priority?: string;
  source?: string;
  watchedUserIds?: string[];
  labelIds?: string[];
}

export const ticketFactory = async (params: ITicketFactoryInput = {}) => {
  const board = await boardFactory({ type: BOARD_TYPES.TICKET });
  const pipeline = await pipelineFactory({ boardId: board._id, type: BOARD_TYPES.TICKET });
  const stage = await stageFactory({ pipelineId: pipeline._id, type: BOARD_TYPES.TICKET });

  const ticket = new Tickets({
    ...params,
    name: faker.random.word(),
    stageId: params.stageId || stage._id,
    ...(!params.noCloseDate ? { closeDate: params.closeDate || new Date() } : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds,
    priority: params.priority,
    source: params.source,
    watchedUserIds: params.watchedUserIds,
    labelIds: params.labelIds || [],
  });

  return ticket.save();
};

interface IGrowthHackFactoryInput {
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
}

export const growthHackFactory = async (params: IGrowthHackFactoryInput = {}) => {
  const board = await boardFactory({ type: BOARD_TYPES.GROWTH_HACK });
  const pipeline = await pipelineFactory({ boardId: board._id });
  const stage = await stageFactory({ pipelineId: pipeline._id });

  const growthHack = new GrowthHacks({
    ...params,
    name: faker.random.word(),
    stageId: params.stageId || stage._id,
    companyIds: params.companyIds || [faker.random.word()],
    customerIds: params.customerIds || [faker.random.word()],
    ...(!params.noCloseDate ? { closeDate: params.closeDate || new Date() } : {}),
    description: faker.random.word(),
    assignedUserIds: params.assignedUserIds || [faker.random.word()],
    hackStages: params.hackStages || [faker.random.word()],
    votedUserIds: params.votedUserIds,
    watchedUserIds: params.watchedUserIds,
    ease: params.ease || 0,
    impact: params.impact || 0,
    priority: params.priority,
    labelIds: params.labelIds || [],
  });

  return growthHack.save();
};

interface IProductFactoryInput {
  name?: string;
  type?: string;
  description?: string;
  tagIds?: string[];
  categoryId?: string;
  customFieldsData?: object;
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
    tagIds: params.tagIds || [],
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

export const productCategoryFactory = async (params: IProductCategoryFactoryInput = {}) => {
  const productCategory = new ProductCategories({
    name: params.name || faker.random.word(),
    description: params.description || faker.random.word(),
    parentId: params.parentId,
    code: await getUniqueValue(ProductCategories, 'code', params.code),
    order: params.order || faker.random.word(),
    createdAt: new Date(),
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
  errorMsgs?: string[];
  ids?: string[];
}

export const importHistoryFactory = async (params: IImportHistoryFactoryInput) => {
  const user = await userFactory({});

  const doc = {
    failed: params.failed || faker.random.number(),
    total: params.total || faker.random.number(),
    success: params.success || faker.random.number(),
    ids: params.ids,
    contentType: params.contentType || 'customer',
    errorMsgs: params.errorMsgs,
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
    credentials: params.credentials,
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
    kbTopicId: params.kbTopicId,
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
    allowed: params.allowed || false,
    userId: params.userId,
    requiredActions: params.requiredActions || [],
    groupId: params.groupId,
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
    isVisible: params.isVisible === undefined || params.isVisible === null ? true : params.isVisible,
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
