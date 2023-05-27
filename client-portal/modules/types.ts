export type Store = {
  currentUser: IUser;
  topic: Topic;
  config: Config;
  router: any;
  notificationsCount: number;
};

export type Ticket = {
  stageId: string;
  subject: string;
  description?: string;
  requestor: string;
  priority: string;
  customFieldsData: ICustomField[];
  attachments: IAttachment[];
  labelIds: string[];
};

export type IOption = {
  label: string;
  value: string;
  avatar?: string;
};

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
  locationValue?: ILocationOption;
}

export interface IAttachment {
  name: string;
  type: string;
  url: string;
  size?: number;
  duration?: number;
}

export interface IFieldLogic {
  fieldId?: string;
  tempFieldId?: string;
  logicOperator: string;
  logicValue: string;
  __typename?: string;
}

export interface ILocationOption {
  lat: number;
  lng: number;
  description?: string;
  marker?: string;
}

export interface IObjectListConfig {
  key: string;
  label: string;
  type: string;
}

export interface IField {
  _id: string;
  key?: string;
  contentType: string;
  contentTypeId?: string;
  type: string;
  validation?: string;
  field?: string;
  text?: string;
  code?: string;
  content?: string;
  description?: string;
  options?: string[];
  locationOptions?: ILocationOption[];
  objectListConfigs?: IObjectListConfig[];
  isRequired?: boolean;
  order?: React.ReactNode;
  canHide?: boolean;
  isVisible?: boolean;
  isVisibleInDetail?: boolean;
  isVisibleToCreate?: boolean;
  isDefinedByErxes?: boolean;
  groupId?: string;
  lastUpdatedUser?: IUser;
  lastUpdatedUserId?: string;
  associatedFieldId?: string;
  column?: number;
  associatedField?: {
    _id: string;
    text: string;
    contentType: string;
  };
  logics?: IFieldLogic[];
  logicAction?: string;
  groupName?: string;
  pageNumber?: number;
  searchable?: boolean;
  showInCard?: boolean;
  keys?: string[];
  productCategoryId?: string;
  optionsValues?: string;
}

export type Task = {
  stageId: string;
  subject: string;
  description?: string;
  requestor: string;
  priority: string;
};

export type Label = {
  _id: string;
  name: string;
  colorCode: string;
};

export type Config = {
  _id?: string;
  name?: string;
  description?: string;
  logo?: string;
  icon?: string;
  headerHtml?: string;
  footerHtml?: string;
  url?: string;

  messengerBrandCode?: string;
  knowledgeBaseLabel?: string;
  knowledgeBaseTopicId?: string;
  taskPublicPipelineId?: string;
  taskPublicLabel?: string;
  taskPublicBoardId?: string;
  ticketLabel?: string;
  dealLabel?: string;
  purchaseLabel?:string;
  taskLabel?: string;
  taskStageId?: string;
  ticketStageId?: string;
  dealStageId?: string;
  purchaseStageId?: string;
  ticketPipelineId?: string;
  dealPipelineId?: string;
  purchasePipelineId?:string;
  taskPipelineId?: string;

  kbToggle?: boolean;
  publicTaskToggle?: boolean;
  ticketToggle?: boolean;
  taskToggle?: boolean;
  dealToggle?: boolean;
  purchaseToggle?:boolean;

  styles?: {
    bodyColor?: string;
    headerColor?: string;
    footerColor?: string;
    helpColor?: string;
    backgroundColor?: string;
    activeTabColor?: string;
    baseColor?: string;
    headingColor?: string;
    linkColor?: string;
    linkHoverColor?: string;
    baseFont?: string;
    headingFont?: string;
    dividerColor?: string;
    primaryBtnColor?: string;
    secondaryBtnColor?: string;
  };

  advanced?: {
    authAllow?: string;
    permission?: string;
    viewTicket?: string;
  };
  googleClientId?: string;
  facebookAppId?: string;
  erxesAppToken?: string;
};

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface IKbCategory extends ICommonFields {
  _id: string;
  title: string;
  description: string;
  articleIds: string[];
  icon: string;

  authors: IUser[];
  articles: IKbArticle[];
  numOfArticles: number;
}

export interface IKbParentCategory extends IKbCategory {
  childrens: IKbCategory[];
}

export interface IUserDetails {
  avatar: string;
  fullName: string;
  shortName: string;
  position: string;
  description: string;
}

export interface INotifcationSettings {
  receiveByEmail?: boolean;
  receiveBySms?: boolean;
}

export interface IErxesForm {
  brandId: string;
  formId: string;
}
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  details?: IUserDetails;
  type: string;
  companyName: string;

  notificationSettings?: INotifcationSettings;
}

export interface IStage {
  _id: string;
  name: string;
  type: string;
  probability: string;
  index?: number;
  itemId?: string;
  amount?: any;
  itemsTotalCount: number;
  formId: string;
  pipelineId: string;
  status: string;
  order: number;
}

export interface ITicket {
  source?: string;
  _id: string;
  name: string;
  order: number;
  stageId: string;
  boardId?: string;
  closeDate: Date;
  description: string;
  amount: number;
  modifiedAt: Date;
  assignedUserIds?: string[];
  assignedUsers: IUser[];
  createdUser?: IUser;
  stage?: IStage;
  isWatched?: boolean;
  priority?: string;
  hasNotified?: boolean;
  isComplete: boolean;
  reminderMinute: number;
  labelIds: string[];
  status?: string;
  createdAt: Date;
  timeTrack: {
    status: string;
    timeSpent: number;
    startDate?: string;
  };
  customFieldsData?: {
    [key: string]: any;
  };
}

export type GroupBy = {
  groupBy: string;
  setGroupBy: string;
};

export type ViewMode = {
  viewMode: string;
  setViewMode: string;
};

export interface IKbArticle extends ICommonFields {
  _id: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  forms?: IErxesForm[];
  categoryId?: string;
  reactionChoices?: string[];
  createdUser: IUser;
}

export interface INotification {
  _id: string;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
  createdAt: Date;
}

export type Topic = {
  _id: string;
  title: string;
  description: string;
  brandId: string;
  categoryIds: string[];
  color: string;
  backgroundImage: string;
  languageCode?: string;

  categories: IKbCategory[];
  parentCategories: IKbParentCategory[];
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
};

export type ConfigQueryResponse = {
  clientPortalGetConfig: Config;
};

export type TopicQueryResponse = {
  knowledgeBaseTopicDetail: Topic;
};

export type UserQueryResponse = {
  clientPortalCurrentUser: IUser;
};

export type NotificationsCountQueryResponse = {
  clientPortalNotificationCount: number;
};

export type NotificationsQueryResponse = {
  clientPortalNotifications: INotification[];
  subscribeToMore: any;
};

export type NotificationDetailQueryResponse = {
  clientPortalNotificationDetail: INotification;
};
