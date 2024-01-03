export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
  JSON: { input: any; output: any };
};

export type ActivityLog = {
  __typename?: 'ActivityLog';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  content?: Maybe<Scalars['JSON']['output']>;
  contentDetail?: Maybe<Scalars['JSON']['output']>;
  contentId?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<Scalars['String']['output']>;
  contentTypeDetail?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByDetail?: Maybe<Scalars['JSON']['output']>;
};

export type ActivityLogByAction = {
  __typename?: 'ActivityLogByAction';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  content?: Maybe<Scalars['JSON']['output']>;
  contentId?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<Scalars['String']['output']>;
  contentTypeDetail?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdUser?: Maybe<User>;
};

export type ActivityLogByActionResponse = {
  __typename?: 'ActivityLogByActionResponse';
  activityLogs?: Maybe<Array<Maybe<ActivityLogByAction>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type App = {
  __typename?: 'App';
  _id?: Maybe<Scalars['String']['output']>;
  accessToken?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  expireDate?: Maybe<Scalars['Date']['output']>;
  isEnabled?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  userGroupId?: Maybe<Scalars['String']['output']>;
  userGroupName?: Maybe<Scalars['String']['output']>;
};

export type Attachment = {
  __typename?: 'Attachment';
  duration?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type AttachmentInput = {
  duration?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  size?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type Board = {
  __typename?: 'Board';
  _id: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['Date']['output']>;
  name: Scalars['String']['output'];
  order?: Maybe<Scalars['Int']['output']>;
  pipelines?: Maybe<Array<Maybe<Pipeline>>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type BoardCount = {
  __typename?: 'BoardCount';
  _id?: Maybe<Scalars['String']['output']>;
  count?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Branch = {
  __typename?: 'Branch';
  _id: Scalars['String']['output'];
  address?: Maybe<Scalars['String']['output']>;
  children?: Maybe<Array<Maybe<Branch>>>;
  code?: Maybe<Scalars['String']['output']>;
  coordinate?: Maybe<Coordinate>;
  email?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Attachment>;
  links?: Maybe<Scalars['JSON']['output']>;
  order?: Maybe<Scalars['String']['output']>;
  parent?: Maybe<Branch>;
  parentId?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  radius?: Maybe<Scalars['Int']['output']>;
  supervisor?: Maybe<User>;
  supervisorId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  userCount?: Maybe<Scalars['Int']['output']>;
  userIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  users?: Maybe<Array<Maybe<User>>>;
};

export type BranchListQueryResponse = {
  __typename?: 'BranchListQueryResponse';
  list?: Maybe<Array<Maybe<Branch>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
  totalUsersCount?: Maybe<Scalars['Int']['output']>;
};

export type Brand = {
  __typename?: 'Brand';
  _id: Scalars['String']['output'];
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  emailConfig?: Maybe<Scalars['JSON']['output']>;
  memberIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  name?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export enum BusinessPortalKind {
  Client = 'client',
  Vendor = 'vendor'
}

export type CpAuthPayload = {
  __typename?: 'CPAuthPayload';
  refreshToken?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
};

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type Callout = {
  __typename?: 'Callout';
  body?: Maybe<Scalars['String']['output']>;
  buttonText?: Maybe<Scalars['String']['output']>;
  featuredImage?: Maybe<Scalars['String']['output']>;
  skip?: Maybe<Scalars['Boolean']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type Checklist = {
  __typename?: 'Checklist';
  _id: Scalars['String']['output'];
  contentType?: Maybe<Scalars['String']['output']>;
  contentTypeId?: Maybe<Scalars['String']['output']>;
  createdDate?: Maybe<Scalars['Date']['output']>;
  createdUserId?: Maybe<Scalars['String']['output']>;
  items?: Maybe<Array<Maybe<ChecklistItem>>>;
  percent?: Maybe<Scalars['Float']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type ChecklistItem = {
  __typename?: 'ChecklistItem';
  _id: Scalars['String']['output'];
  checklistId?: Maybe<Scalars['String']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  isChecked?: Maybe<Scalars['Boolean']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
};

export type ClientPortal = {
  __typename?: 'ClientPortal';
  _id: Scalars['String']['output'];
  dealBoardId?: Maybe<Scalars['String']['output']>;
  dealLabel?: Maybe<Scalars['String']['output']>;
  dealPipelineId?: Maybe<Scalars['String']['output']>;
  dealStageId?: Maybe<Scalars['String']['output']>;
  dealToggle?: Maybe<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dnsStatus?: Maybe<Scalars['String']['output']>;
  domain?: Maybe<Scalars['String']['output']>;
  erxesAppToken?: Maybe<Scalars['String']['output']>;
  facebookAppId?: Maybe<Scalars['String']['output']>;
  footerHtml?: Maybe<Scalars['String']['output']>;
  googleClientId?: Maybe<Scalars['String']['output']>;
  googleClientSecret?: Maybe<Scalars['String']['output']>;
  googleCredentials?: Maybe<Scalars['JSON']['output']>;
  googleRedirectUri?: Maybe<Scalars['String']['output']>;
  headerHtml?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  kbToggle?: Maybe<Scalars['Boolean']['output']>;
  kind: BusinessPortalKind;
  knowledgeBaseLabel?: Maybe<Scalars['String']['output']>;
  knowledgeBaseTopicId?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  mailConfig?: Maybe<MailConfig>;
  manualVerificationConfig?: Maybe<ManualVerificationConfig>;
  messengerBrandCode?: Maybe<Scalars['String']['output']>;
  mobileResponsive?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  otpConfig?: Maybe<OtpConfig>;
  passwordVerificationConfig?: Maybe<PasswordVerificationConfig>;
  publicTaskToggle?: Maybe<Scalars['Boolean']['output']>;
  purchaseBoardId?: Maybe<Scalars['String']['output']>;
  purchaseLabel?: Maybe<Scalars['String']['output']>;
  purchasePipelineId?: Maybe<Scalars['String']['output']>;
  purchaseStageId?: Maybe<Scalars['String']['output']>;
  purchaseToggle?: Maybe<Scalars['Boolean']['output']>;
  refreshTokenExpiration?: Maybe<Scalars['Int']['output']>;
  styles?: Maybe<Styles>;
  taskBoardId?: Maybe<Scalars['String']['output']>;
  taskLabel?: Maybe<Scalars['String']['output']>;
  taskPipelineId?: Maybe<Scalars['String']['output']>;
  taskPublicBoardId?: Maybe<Scalars['String']['output']>;
  taskPublicLabel?: Maybe<Scalars['String']['output']>;
  taskPublicPipelineId?: Maybe<Scalars['String']['output']>;
  taskStageId?: Maybe<Scalars['String']['output']>;
  taskToggle?: Maybe<Scalars['Boolean']['output']>;
  ticketBoardId?: Maybe<Scalars['String']['output']>;
  ticketLabel?: Maybe<Scalars['String']['output']>;
  ticketPipelineId?: Maybe<Scalars['String']['output']>;
  ticketStageId?: Maybe<Scalars['String']['output']>;
  ticketToggle?: Maybe<Scalars['Boolean']['output']>;
  tokenExpiration?: Maybe<Scalars['Int']['output']>;
  tokenPassMethod?: Maybe<TokenPassMethod>;
  url?: Maybe<Scalars['String']['output']>;
  vendorParentProductCategoryId?: Maybe<Scalars['String']['output']>;
};

export type ClientPortalComment = {
  __typename?: 'ClientPortalComment';
  _id: Scalars['String']['output'];
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<ClientPortalUser>;
  type?: Maybe<Scalars['String']['output']>;
  typeId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userType?: Maybe<Scalars['String']['output']>;
};

export type ClientPortalConfigInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  dealBoardId?: InputMaybe<Scalars['String']['input']>;
  dealLabel?: InputMaybe<Scalars['String']['input']>;
  dealPipelineId?: InputMaybe<Scalars['String']['input']>;
  dealStageId?: InputMaybe<Scalars['String']['input']>;
  dealToggle?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dnsStatus?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<Scalars['String']['input']>;
  erxesAppToken?: InputMaybe<Scalars['String']['input']>;
  facebookAppId?: InputMaybe<Scalars['String']['input']>;
  footerHtml?: InputMaybe<Scalars['String']['input']>;
  googleClientId?: InputMaybe<Scalars['String']['input']>;
  googleClientSecret?: InputMaybe<Scalars['String']['input']>;
  googleCredentials?: InputMaybe<Scalars['JSON']['input']>;
  googleRedirectUri?: InputMaybe<Scalars['String']['input']>;
  headerHtml?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  kbToggle?: InputMaybe<Scalars['Boolean']['input']>;
  kind: BusinessPortalKind;
  knowledgeBaseLabel?: InputMaybe<Scalars['String']['input']>;
  knowledgeBaseTopicId?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  mailConfig?: InputMaybe<MailConfigInput>;
  manualVerificationConfig?: InputMaybe<Scalars['JSON']['input']>;
  messengerBrandCode?: InputMaybe<Scalars['String']['input']>;
  mobileResponsive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  otpConfig?: InputMaybe<OtpConfigInput>;
  passwordVerificationConfig?: InputMaybe<Scalars['JSON']['input']>;
  publicTaskToggle?: InputMaybe<Scalars['Boolean']['input']>;
  purchaseBoardId?: InputMaybe<Scalars['String']['input']>;
  purchaseLabel?: InputMaybe<Scalars['String']['input']>;
  purchasePipelineId?: InputMaybe<Scalars['String']['input']>;
  purchaseStageId?: InputMaybe<Scalars['String']['input']>;
  purchaseToggle?: InputMaybe<Scalars['Boolean']['input']>;
  refreshTokenExpiration?: InputMaybe<Scalars['Int']['input']>;
  styles?: InputMaybe<StylesParams>;
  taskBoardId?: InputMaybe<Scalars['String']['input']>;
  taskLabel?: InputMaybe<Scalars['String']['input']>;
  taskPipelineId?: InputMaybe<Scalars['String']['input']>;
  taskPublicBoardId?: InputMaybe<Scalars['String']['input']>;
  taskPublicLabel?: InputMaybe<Scalars['String']['input']>;
  taskPublicPipelineId?: InputMaybe<Scalars['String']['input']>;
  taskStageId?: InputMaybe<Scalars['String']['input']>;
  taskToggle?: InputMaybe<Scalars['Boolean']['input']>;
  ticketBoardId?: InputMaybe<Scalars['String']['input']>;
  ticketLabel?: InputMaybe<Scalars['String']['input']>;
  ticketPipelineId?: InputMaybe<Scalars['String']['input']>;
  ticketStageId?: InputMaybe<Scalars['String']['input']>;
  ticketToggle?: InputMaybe<Scalars['Boolean']['input']>;
  tokenExpiration?: InputMaybe<Scalars['Int']['input']>;
  tokenPassMethod?: InputMaybe<TokenPassMethod>;
  url?: InputMaybe<Scalars['String']['input']>;
  vendorParentProductCategoryId?: InputMaybe<Scalars['String']['input']>;
};

export type ClientPortalFieldConfig = {
  __typename?: 'ClientPortalFieldConfig';
  allowedClientPortalIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  fieldId?: Maybe<Scalars['String']['output']>;
  requiredOn?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type ClientPortalNotification = {
  __typename?: 'ClientPortalNotification';
  _id: Scalars['String']['output'];
  clientPortalId?: Maybe<Scalars['String']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<User>;
  eventData?: Maybe<Scalars['JSON']['output']>;
  isRead?: Maybe<Scalars['Boolean']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  notifType?: Maybe<NotificationType>;
  receiver?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type ClientPortalUser = {
  __typename?: 'ClientPortalUser';
  _id: Scalars['String']['output'];
  avatar?: Maybe<Scalars['String']['output']>;
  clientPortal?: Maybe<ClientPortal>;
  clientPortalId?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  companyName?: Maybe<Scalars['String']['output']>;
  companyRegistrationNumber?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customFieldsDataByFieldCode?: Maybe<Scalars['JSON']['output']>;
  customer?: Maybe<Customer>;
  email?: Maybe<Scalars['String']['output']>;
  erxesCompanyId?: Maybe<Scalars['String']['output']>;
  erxesCustomerId?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  isEmailVerified?: Maybe<Scalars['Boolean']['output']>;
  isOnline?: Maybe<Scalars['Boolean']['output']>;
  isPhoneVerified?: Maybe<Scalars['Boolean']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  lastSeenAt?: Maybe<Scalars['Date']['output']>;
  links?: Maybe<Scalars['JSON']['output']>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  notificationSettings?: Maybe<UserNotificationSettings>;
  ownerId?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  sessionCount?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  verificationRequest?: Maybe<VerificationRequest>;
};

export type ClientPortalUserUpdate = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  companyRegistrationNumber?: InputMaybe<Scalars['String']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  isEmailVerified?: InputMaybe<Scalars['Boolean']['input']>;
  isOnline?: InputMaybe<Scalars['Boolean']['input']>;
  isPhoneVerified?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export enum ClientPortalUserVerificationStatus {
  NotVerified = 'notVerified',
  Pending = 'pending',
  Verified = 'verified'
}

export type ColumnConfigItem = {
  __typename?: 'ColumnConfigItem';
  label?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
};

export type CompaniesListResponse = {
  __typename?: 'CompaniesListResponse';
  list?: Maybe<Array<Maybe<Company>>>;
  totalCount?: Maybe<Scalars['Float']['output']>;
};

export type Company = {
  __typename?: 'Company';
  _id: Scalars['String']['output'];
  addresses?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  avatar?: Maybe<Scalars['String']['output']>;
  businessType?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customFieldsDataByFieldCode?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Array<Maybe<Customer>>>;
  description?: Maybe<Scalars['String']['output']>;
  emails?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  industry?: Maybe<Scalars['String']['output']>;
  isSubscribed?: Maybe<Scalars['String']['output']>;
  links?: Maybe<Scalars['JSON']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  mergedIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  names?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  owner?: Maybe<User>;
  ownerId?: Maybe<Scalars['String']['output']>;
  parentCompany?: Maybe<Company>;
  parentCompanyId?: Maybe<Scalars['String']['output']>;
  phones?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  plan?: Maybe<Scalars['String']['output']>;
  primaryAddress?: Maybe<Scalars['JSON']['output']>;
  primaryEmail?: Maybe<Scalars['String']['output']>;
  primaryName?: Maybe<Scalars['String']['output']>;
  primaryPhone?: Maybe<Scalars['String']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  trackedData?: Maybe<Scalars['JSON']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type CompanyProductConfig = {
  __typename?: 'CompanyProductConfig';
  companyId: Scalars['ID']['output'];
  specificPrice?: Maybe<Scalars['Float']['output']>;
};

export type CompanyProductConfigInput = {
  companyId: Scalars['ID']['input'];
  specificPrice?: InputMaybe<Scalars['Float']['input']>;
};

export type Config = {
  __typename?: 'Config';
  _id: Scalars['String']['output'];
  code: Scalars['String']['output'];
  value?: Maybe<Scalars['JSON']['output']>;
};

export type Conformity = {
  __typename?: 'Conformity';
  _id: Scalars['String']['output'];
  mainType?: Maybe<Scalars['String']['output']>;
  mainTypeId?: Maybe<Scalars['String']['output']>;
  relType?: Maybe<Scalars['String']['output']>;
  relTypeId?: Maybe<Scalars['String']['output']>;
};

export type Contacts = {
  __typename?: 'Contacts';
  _id?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  primaryEmail?: Maybe<Scalars['String']['output']>;
  primaryPhone?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type ConvertTo = {
  __typename?: 'ConvertTo';
  dealUrl?: Maybe<Scalars['String']['output']>;
  purchaseUrl?: Maybe<Scalars['String']['output']>;
  taskUrl?: Maybe<Scalars['String']['output']>;
  ticketUrl?: Maybe<Scalars['String']['output']>;
};

export type Coordinate = {
  __typename?: 'Coordinate';
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
};

export type CoordinateInput = {
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
};

export type Cost = {
  __typename?: 'Cost';
  code?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type CostObjectInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Customer = {
  __typename?: 'Customer';
  _id: Scalars['String']['output'];
  addresses?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  avatar?: Maybe<Scalars['String']['output']>;
  birthDate?: Maybe<Scalars['Date']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  companies?: Maybe<Array<Maybe<Company>>>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customFieldsDataByFieldCode?: Maybe<Scalars['JSON']['output']>;
  department?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailValidationStatus?: Maybe<Scalars['String']['output']>;
  emails?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  firstName?: Maybe<Scalars['String']['output']>;
  hasAuthority?: Maybe<Scalars['String']['output']>;
  integrationId?: Maybe<Scalars['String']['output']>;
  isOnline?: Maybe<Scalars['Boolean']['output']>;
  isSubscribed?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  lastSeenAt?: Maybe<Scalars['Date']['output']>;
  leadStatus?: Maybe<Scalars['String']['output']>;
  links?: Maybe<Scalars['JSON']['output']>;
  location?: Maybe<Scalars['JSON']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  owner?: Maybe<User>;
  ownerId?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  phoneValidationStatus?: Maybe<Scalars['String']['output']>;
  phones?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  position?: Maybe<Scalars['String']['output']>;
  primaryAddress?: Maybe<Scalars['JSON']['output']>;
  primaryEmail?: Maybe<Scalars['String']['output']>;
  primaryPhone?: Maybe<Scalars['String']['output']>;
  remoteAddress?: Maybe<Scalars['String']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  sessionCount?: Maybe<Scalars['Int']['output']>;
  sex?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  trackedData?: Maybe<Scalars['JSON']['output']>;
  urlVisits?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  visitorContactInfo?: Maybe<Scalars['JSON']['output']>;
};

export type CustomerConnectionChangedResponse = {
  __typename?: 'CustomerConnectionChangedResponse';
  _id: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type CustomersListResponse = {
  __typename?: 'CustomersListResponse';
  list?: Maybe<Array<Maybe<Customer>>>;
  totalCount?: Maybe<Scalars['Float']['output']>;
};

export type Deal = {
  __typename?: 'Deal';
  _id: Scalars['String']['output'];
  amount?: Maybe<Scalars['JSON']['output']>;
  assignedUserIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  assignedUsers?: Maybe<Array<Maybe<User>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  boardId?: Maybe<Scalars['String']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  companies?: Maybe<Array<Maybe<Company>>>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<User>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Array<Maybe<Customer>>>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  description?: Maybe<Scalars['String']['output']>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labelIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  labels?: Maybe<Array<Maybe<PipelineLabel>>>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  modifiedBy?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Float']['output']>;
  paymentsData?: Maybe<Scalars['JSON']['output']>;
  pipeline?: Maybe<Pipeline>;
  priority?: Maybe<Scalars['String']['output']>;
  products?: Maybe<Scalars['JSON']['output']>;
  productsData?: Maybe<Scalars['JSON']['output']>;
  reminderMinute?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  stage?: Maybe<Stage>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  stageId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  timeTrack?: Maybe<TimeTrack>;
  unUsedAmount?: Maybe<Scalars['JSON']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type DealListItem = {
  __typename?: 'DealListItem';
  _id: Scalars['String']['output'];
  amount?: Maybe<Scalars['JSON']['output']>;
  assignedUsers?: Maybe<Scalars['JSON']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  branches?: Maybe<Array<Maybe<Branch>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  companies?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUserId?: Maybe<Scalars['String']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Scalars['JSON']['output']>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  departments?: Maybe<Array<Maybe<Department>>>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labels?: Maybe<Scalars['JSON']['output']>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  products?: Maybe<Scalars['JSON']['output']>;
  relations?: Maybe<Scalars['JSON']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  stage?: Maybe<Scalars['JSON']['output']>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  unUsedAmount?: Maybe<Scalars['JSON']['output']>;
};

export type DealTotalCurrency = {
  __typename?: 'DealTotalCurrency';
  amount?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Department = {
  __typename?: 'Department';
  _id: Scalars['String']['output'];
  childCount?: Maybe<Scalars['Int']['output']>;
  children?: Maybe<Array<Maybe<Department>>>;
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['String']['output']>;
  parent?: Maybe<Department>;
  parentId?: Maybe<Scalars['String']['output']>;
  supervisor?: Maybe<User>;
  supervisorId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  userCount?: Maybe<Scalars['Int']['output']>;
  userIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  users?: Maybe<Array<Maybe<User>>>;
};

export type DepartmentListQueryResponse = {
  __typename?: 'DepartmentListQueryResponse';
  list?: Maybe<Array<Maybe<Department>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
  totalUsersCount?: Maybe<Scalars['Int']['output']>;
};

export type Env = {
  __typename?: 'ENV';
  USE_BRAND_RESTRICTIONS?: Maybe<Scalars['String']['output']>;
};

export type EmailDelivery = {
  __typename?: 'EmailDelivery';
  _id: Scalars['String']['output'];
  attachments?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  bcc?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  body?: Maybe<Scalars['String']['output']>;
  cc?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customerId?: Maybe<Scalars['String']['output']>;
  from?: Maybe<Scalars['String']['output']>;
  fromEmail?: Maybe<Scalars['String']['output']>;
  fromUser?: Maybe<User>;
  kind?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type EmailDeliveryList = {
  __typename?: 'EmailDeliveryList';
  list?: Maybe<Array<Maybe<EmailDelivery>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EmailSignature = {
  brandId?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['String']['input']>;
};

export type Field = {
  __typename?: 'Field';
  _id: Scalars['String']['output'];
  associatedField?: Maybe<Field>;
  associatedFieldId?: Maybe<Scalars['String']['output']>;
  canHide?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  column?: Maybe<Scalars['Int']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  contentType: Scalars['String']['output'];
  contentTypeId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  field?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['String']['output']>;
  groupName?: Maybe<Scalars['String']['output']>;
  isDefinedByErxes?: Maybe<Scalars['Boolean']['output']>;
  isRequired?: Maybe<Scalars['Boolean']['output']>;
  isVisible?: Maybe<Scalars['Boolean']['output']>;
  isVisibleInDetail?: Maybe<Scalars['Boolean']['output']>;
  isVisibleToCreate?: Maybe<Scalars['Boolean']['output']>;
  lastUpdatedUser?: Maybe<User>;
  lastUpdatedUserId?: Maybe<Scalars['String']['output']>;
  locationOptions?: Maybe<Array<Maybe<LocationOption>>>;
  logicAction?: Maybe<Scalars['String']['output']>;
  logics?: Maybe<Array<Maybe<Logic>>>;
  name?: Maybe<Scalars['String']['output']>;
  objectListConfigs?: Maybe<Array<Maybe<ObjectListConfig>>>;
  options?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  optionsValues?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  pageNumber?: Maybe<Scalars['Int']['output']>;
  productCategoryId?: Maybe<Scalars['String']['output']>;
  relationType?: Maybe<Scalars['String']['output']>;
  searchable?: Maybe<Scalars['Boolean']['output']>;
  showInCard?: Maybe<Scalars['Boolean']['output']>;
  subFieldIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  subFields?: Maybe<Array<Maybe<Field>>>;
  text?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  validation?: Maybe<Scalars['String']['output']>;
};

export type FieldItem = {
  _id?: InputMaybe<Scalars['String']['input']>;
  associatedFieldId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  column?: InputMaybe<Scalars['Int']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  field?: InputMaybe<Scalars['String']['input']>;
  groupName?: InputMaybe<Scalars['String']['input']>;
  isDefinedByErxes?: InputMaybe<Scalars['Boolean']['input']>;
  isRequired?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleToCreate?: InputMaybe<Scalars['Boolean']['input']>;
  locationOptions?: InputMaybe<Array<InputMaybe<LocationOptionInput>>>;
  logicAction?: InputMaybe<Scalars['String']['input']>;
  logics?: InputMaybe<Array<InputMaybe<LogicInput>>>;
  objectListConfigs?: InputMaybe<Array<InputMaybe<ObjectListConfigInput>>>;
  options?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  optionsValues?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  pageNumber?: InputMaybe<Scalars['Int']['input']>;
  productCategoryId?: InputMaybe<Scalars['String']['input']>;
  searchable?: InputMaybe<Scalars['Boolean']['input']>;
  showInCard?: InputMaybe<Scalars['Boolean']['input']>;
  subFieldIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tempFieldId?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  validation?: InputMaybe<Scalars['String']['input']>;
};

export type FieldsGroup = {
  __typename?: 'FieldsGroup';
  _id: Scalars['String']['output'];
  alwaysOpen?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  config?: Maybe<Scalars['JSON']['output']>;
  contentType?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fields?: Maybe<Array<Maybe<Field>>>;
  isDefinedByErxes?: Maybe<Scalars['Boolean']['output']>;
  isMultiple?: Maybe<Scalars['Boolean']['output']>;
  isVisible?: Maybe<Scalars['Boolean']['output']>;
  isVisibleInDetail?: Maybe<Scalars['Boolean']['output']>;
  lastUpdatedUser?: Maybe<User>;
  lastUpdatedUserId?: Maybe<Scalars['String']['output']>;
  logicAction?: Maybe<Scalars['String']['output']>;
  logics?: Maybe<Array<Maybe<Logic>>>;
  name?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  parentId?: Maybe<Scalars['String']['output']>;
};

export type Form = {
  __typename?: 'Form';
  _id: Scalars['String']['output'];
  buttonText?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdDate?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<User>;
  createdUserId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fields?: Maybe<Array<Maybe<Field>>>;
  googleMapApiKey?: Maybe<Scalars['String']['output']>;
  numberOfPages?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type FormSubmission = {
  __typename?: 'FormSubmission';
  _id: Scalars['String']['output'];
  customerId?: Maybe<Scalars['String']['output']>;
  formFieldId?: Maybe<Scalars['String']['output']>;
  formFieldText?: Maybe<Scalars['String']['output']>;
  formId?: Maybe<Scalars['String']['output']>;
  submittedAt?: Maybe<Scalars['Date']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['JSON']['output']>;
};

export type FormSubmissionInput = {
  _id: Scalars['String']['input'];
  value?: InputMaybe<Scalars['JSON']['input']>;
};

export type GrowthHack = {
  __typename?: 'GrowthHack';
  _id: Scalars['String']['output'];
  assignedUserIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  assignedUsers?: Maybe<Array<Maybe<User>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  boardId?: Maybe<Scalars['String']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  confidence?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<User>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  description?: Maybe<Scalars['String']['output']>;
  ease?: Maybe<Scalars['Int']['output']>;
  formFields?: Maybe<Array<Maybe<Field>>>;
  formId?: Maybe<Scalars['String']['output']>;
  formSubmissions?: Maybe<Scalars['JSON']['output']>;
  hackStages?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  impact?: Maybe<Scalars['Int']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isVoted?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labelIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  labels?: Maybe<Array<Maybe<PipelineLabel>>>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  modifiedBy?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Float']['output']>;
  pipeline?: Maybe<Pipeline>;
  priority?: Maybe<Scalars['String']['output']>;
  reach?: Maybe<Scalars['Int']['output']>;
  reminderMinute?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  scoringType?: Maybe<Scalars['String']['output']>;
  stage?: Maybe<Stage>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  stageId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  timeTrack?: Maybe<TimeTrack>;
  userId?: Maybe<Scalars['String']['output']>;
  voteCount?: Maybe<Scalars['Int']['output']>;
  votedUsers?: Maybe<Array<Maybe<User>>>;
};

export type InputRule = {
  _id: Scalars['String']['input'];
  condition: Scalars['String']['input'];
  kind: Scalars['String']['input'];
  text: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type InsuranceCategory = {
  __typename?: 'InsuranceCategory';
  _id: Scalars['ID']['output'];
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastModifiedAt?: Maybe<Scalars['Date']['output']>;
  lastModifiedBy?: Maybe<User>;
  name?: Maybe<Scalars['String']['output']>;
  riskIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  risks?: Maybe<Array<Maybe<Risk>>>;
};

export type InsuranceCategoryList = {
  __typename?: 'InsuranceCategoryList';
  list?: Maybe<Array<Maybe<InsuranceCategory>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type InsuranceItem = {
  __typename?: 'InsuranceItem';
  _id: Scalars['ID']['output'];
  company?: Maybe<Company>;
  companyID?: Maybe<Scalars['ID']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customer?: Maybe<Customer>;
  customerID?: Maybe<Scalars['ID']['output']>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
  vendorUser?: Maybe<ClientPortalUser>;
  vendorUserId?: Maybe<Scalars['ID']['output']>;
};

export type InsuranceItemInput = {
  companyID: Scalars['ID']['input'];
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  customerID: Scalars['ID']['input'];
};

export type InsuranceItemListResult = {
  __typename?: 'InsuranceItemListResult';
  list?: Maybe<Array<Maybe<InsuranceItem>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type InsurancePackage = {
  __typename?: 'InsurancePackage';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Date']['output'];
  lastModifiedAt?: Maybe<Scalars['Date']['output']>;
  lastModifiedBy?: Maybe<User>;
  name: Scalars['String']['output'];
  productIds: Array<Scalars['ID']['output']>;
  products?: Maybe<Array<Maybe<InsuranceProduct>>>;
};

export type InsurancePackageInput = {
  name: Scalars['String']['input'];
  productIds: Array<Scalars['ID']['input']>;
};

export type InsurancePackageList = {
  __typename?: 'InsurancePackageList';
  list: Array<InsurancePackage>;
  totalCount: Scalars['Int']['output'];
};

export type InsuranceProduct = {
  __typename?: 'InsuranceProduct';
  _id: Scalars['ID']['output'];
  category?: Maybe<InsuranceCategory>;
  categoryId?: Maybe<Scalars['ID']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  companyProductConfigs?: Maybe<Array<Maybe<CompanyProductConfig>>>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastModifiedBy?: Maybe<User>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  riskConfigs?: Maybe<Array<Maybe<RiskConfig>>>;
  updatedAt?: Maybe<Scalars['Date']['output']>;
};

export type InsuranceProductList = {
  __typename?: 'InsuranceProductList';
  list?: Maybe<Array<Maybe<InsuranceProduct>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type InsuranceProductOfVendor = {
  __typename?: 'InsuranceProductOfVendor';
  _id: Scalars['ID']['output'];
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  riskConfigs?: Maybe<Array<Maybe<RiskConfig>>>;
  updatedAt?: Maybe<Scalars['Date']['output']>;
};

export type Interval = {
  endTime?: InputMaybe<Scalars['Date']['input']>;
  startTime?: InputMaybe<Scalars['Date']['input']>;
};

export type InvitationEntry = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  channelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  unitId?: InputMaybe<Scalars['String']['input']>;
};

export type ItemDate = {
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type LocationOption = {
  __typename?: 'LocationOption';
  description?: Maybe<Scalars['String']['output']>;
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
};

export type LocationOptionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
};

export type Log = {
  __typename?: 'Log';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  addedData?: Maybe<Scalars['String']['output']>;
  changedData?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  extraDesc?: Maybe<Scalars['String']['output']>;
  newData?: Maybe<Scalars['String']['output']>;
  objectId?: Maybe<Scalars['String']['output']>;
  oldData?: Maybe<Scalars['String']['output']>;
  removedData?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  unchangedData?: Maybe<Scalars['String']['output']>;
  unicode?: Maybe<Scalars['String']['output']>;
};

export type LogList = {
  __typename?: 'LogList';
  logs?: Maybe<Array<Maybe<Log>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type Logic = {
  __typename?: 'Logic';
  fieldId: Scalars['String']['output'];
  logicOperator?: Maybe<Scalars['String']['output']>;
  logicValue?: Maybe<Scalars['JSON']['output']>;
};

export type LogicInput = {
  fieldId?: InputMaybe<Scalars['String']['input']>;
  logicOperator?: InputMaybe<Scalars['String']['input']>;
  logicValue?: InputMaybe<Scalars['JSON']['input']>;
  tempFieldId?: InputMaybe<Scalars['String']['input']>;
};

export type MailConfig = {
  __typename?: 'MailConfig';
  invitationContent?: Maybe<Scalars['String']['output']>;
  registrationContent?: Maybe<Scalars['String']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
};

export type MailConfigInput = {
  invitationContent?: InputMaybe<Scalars['String']['input']>;
  registrationContent?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
};

export type ManualVerificationConfig = {
  __typename?: 'ManualVerificationConfig';
  userIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  verifyCompany?: Maybe<Scalars['Boolean']['output']>;
  verifyCustomer?: Maybe<Scalars['Boolean']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  appsAdd?: Maybe<App>;
  appsEdit?: Maybe<App>;
  appsRemove?: Maybe<Scalars['JSON']['output']>;
  boardItemUpdateTimeTracking?: Maybe<Scalars['JSON']['output']>;
  boardItemsSaveForGanttTimeline?: Maybe<Scalars['String']['output']>;
  boardsAdd?: Maybe<Board>;
  boardsEdit?: Maybe<Board>;
  boardsRemove?: Maybe<Scalars['JSON']['output']>;
  branchesAdd?: Maybe<Branch>;
  branchesEdit?: Maybe<Branch>;
  branchesRemove?: Maybe<Scalars['JSON']['output']>;
  brandsAdd?: Maybe<Brand>;
  brandsEdit?: Maybe<Brand>;
  brandsRemove?: Maybe<Scalars['JSON']['output']>;
  checklistItemsAdd?: Maybe<ChecklistItem>;
  checklistItemsEdit?: Maybe<ChecklistItem>;
  checklistItemsOrder?: Maybe<ChecklistItem>;
  checklistItemsRemove?: Maybe<ChecklistItem>;
  checklistsAdd?: Maybe<Checklist>;
  checklistsEdit?: Maybe<Checklist>;
  checklistsRemove?: Maybe<Checklist>;
  clientPortalCommentsAdd?: Maybe<ClientPortalComment>;
  clientPortalCommentsRemove?: Maybe<Scalars['String']['output']>;
  clientPortalConfigUpdate?: Maybe<ClientPortal>;
  clientPortalConfirmInvitation?: Maybe<ClientPortalUser>;
  clientPortalCreateCard?: Maybe<Scalars['JSON']['output']>;
  clientPortalFacebookAuthentication?: Maybe<Scalars['JSON']['output']>;
  clientPortalFieldConfigsEdit?: Maybe<ClientPortalFieldConfig>;
  clientPortalFieldConfigsRemove?: Maybe<ClientPortalFieldConfig>;
  clientPortalForgotPassword: Scalars['String']['output'];
  clientPortalGoogleAuthentication?: Maybe<Scalars['JSON']['output']>;
  clientPortalLogin?: Maybe<Scalars['JSON']['output']>;
  clientPortalLoginWithPhone?: Maybe<Scalars['JSON']['output']>;
  clientPortalLoginWithSocialPay?: Maybe<Scalars['JSON']['output']>;
  clientPortalLogout?: Maybe<Scalars['String']['output']>;
  clientPortalNotificationsMarkAsRead?: Maybe<Scalars['String']['output']>;
  clientPortalNotificationsRemove?: Maybe<Scalars['JSON']['output']>;
  clientPortalRefreshToken?: Maybe<Scalars['String']['output']>;
  clientPortalRegister?: Maybe<Scalars['String']['output']>;
  clientPortalRemove?: Maybe<Scalars['JSON']['output']>;
  clientPortalResetPassword?: Maybe<Scalars['JSON']['output']>;
  clientPortalResetPasswordWithCode?: Maybe<Scalars['String']['output']>;
  clientPortalSendNotification?: Maybe<Scalars['JSON']['output']>;
  clientPortalUpdateUser?: Maybe<Scalars['JSON']['output']>;
  clientPortalUserAssignCompany?: Maybe<Scalars['JSON']['output']>;
  clientPortalUserChangePassword?: Maybe<ClientPortalUser>;
  clientPortalUserUpdateNotificationSettings?: Maybe<ClientPortalUser>;
  clientPortalUsersChangeVerificationStatus?: Maybe<
    Scalars['String']['output']
  >;
  clientPortalUsersEdit?: Maybe<ClientPortalUser>;
  clientPortalUsersInvite?: Maybe<ClientPortalUser>;
  clientPortalUsersRemove?: Maybe<Scalars['JSON']['output']>;
  clientPortalUsersReplacePhone: Scalars['String']['output'];
  clientPortalUsersSendVerificationRequest?: Maybe<Scalars['String']['output']>;
  clientPortalUsersVerify?: Maybe<Scalars['JSON']['output']>;
  clientPortalUsersVerifyPhone: Scalars['String']['output'];
  clientPortalVerifyOTP?: Maybe<Scalars['JSON']['output']>;
  companiesAdd?: Maybe<Company>;
  companiesEdit?: Maybe<Company>;
  companiesEditByField?: Maybe<Company>;
  companiesMerge?: Maybe<Company>;
  companiesRemove?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  configsActivateInstallation?: Maybe<Scalars['JSON']['output']>;
  configsManagePluginInstall?: Maybe<Scalars['JSON']['output']>;
  configsUpdate?: Maybe<Scalars['JSON']['output']>;
  conformityAdd?: Maybe<Conformity>;
  conformityEdit?: Maybe<SuccessResult>;
  customersAdd?: Maybe<Customer>;
  customersChangeState?: Maybe<Customer>;
  customersChangeStateBulk?: Maybe<Scalars['JSON']['output']>;
  customersChangeVerificationStatus?: Maybe<Array<Maybe<Customer>>>;
  customersEdit?: Maybe<Customer>;
  customersEditByField?: Maybe<Customer>;
  customersMerge?: Maybe<Customer>;
  customersRemove?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  customersVerify?: Maybe<Scalars['String']['output']>;
  dealsAdd?: Maybe<Deal>;
  dealsArchive?: Maybe<Scalars['String']['output']>;
  dealsChange?: Maybe<Deal>;
  dealsCopy?: Maybe<Deal>;
  dealsCreateProductsData?: Maybe<Scalars['JSON']['output']>;
  dealsDeleteProductData?: Maybe<Scalars['JSON']['output']>;
  dealsEdit?: Maybe<Deal>;
  dealsEditProductData?: Maybe<Scalars['JSON']['output']>;
  dealsRemove?: Maybe<Deal>;
  dealsWatch?: Maybe<Deal>;
  departmentsAdd?: Maybe<Department>;
  departmentsEdit?: Maybe<Department>;
  departmentsRemove?: Maybe<Scalars['JSON']['output']>;
  fieldsAdd?: Maybe<Field>;
  fieldsBulkAddAndEdit?: Maybe<Array<Maybe<Field>>>;
  fieldsEdit?: Maybe<Field>;
  fieldsGroupsAdd?: Maybe<FieldsGroup>;
  fieldsGroupsEdit?: Maybe<FieldsGroup>;
  fieldsGroupsRemove?: Maybe<Scalars['JSON']['output']>;
  fieldsGroupsUpdateOrder?: Maybe<Array<Maybe<FieldsGroup>>>;
  fieldsGroupsUpdateVisible?: Maybe<FieldsGroup>;
  fieldsRemove?: Maybe<Field>;
  fieldsUpdateOrder?: Maybe<Array<Maybe<Field>>>;
  fieldsUpdateSystemFields?: Maybe<Field>;
  fieldsUpdateVisible?: Maybe<Field>;
  forgotPassword: Scalars['String']['output'];
  formSubmissionsEdit?: Maybe<Submission>;
  formSubmissionsRemove?: Maybe<Scalars['JSON']['output']>;
  formSubmissionsSave?: Maybe<Scalars['Boolean']['output']>;
  formsAdd?: Maybe<Form>;
  formsEdit?: Maybe<Form>;
  growthHacksAdd?: Maybe<GrowthHack>;
  growthHacksArchive?: Maybe<Scalars['String']['output']>;
  growthHacksChange?: Maybe<GrowthHack>;
  growthHacksCopy?: Maybe<GrowthHack>;
  growthHacksEdit?: Maybe<GrowthHack>;
  growthHacksRemove?: Maybe<GrowthHack>;
  growthHacksVote?: Maybe<GrowthHack>;
  growthHacksWatch?: Maybe<GrowthHack>;
  insuranceCategoryAdd?: Maybe<InsuranceCategory>;
  insuranceCategoryEdit?: Maybe<InsuranceCategory>;
  insuranceCategoryRemove?: Maybe<Scalars['String']['output']>;
  insuranceItemAdd?: Maybe<InsuranceItem>;
  insuranceItemEdit?: Maybe<InsuranceItem>;
  insuranceItemRemove?: Maybe<Scalars['JSON']['output']>;
  insurancePackageAdd: InsurancePackage;
  insurancePackageEdit: InsurancePackage;
  insurancePackageRemove?: Maybe<Scalars['JSON']['output']>;
  insuranceProductsAdd?: Maybe<InsuranceProduct>;
  insuranceProductsEdit?: Maybe<InsuranceProduct>;
  insuranceProductsRemove?: Maybe<Scalars['String']['output']>;
  login?: Maybe<Scalars['String']['output']>;
  logout?: Maybe<Scalars['String']['output']>;
  manageExpenses?: Maybe<Array<Maybe<Cost>>>;
  onboardingCheckStatus?: Maybe<Scalars['String']['output']>;
  onboardingCompleteShowStep?: Maybe<Scalars['JSON']['output']>;
  onboardingForceComplete?: Maybe<Scalars['JSON']['output']>;
  permissionsAdd?: Maybe<Array<Maybe<Permission>>>;
  permissionsFix?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  permissionsRemove?: Maybe<Scalars['JSON']['output']>;
  pipelineLabelsAdd?: Maybe<PipelineLabel>;
  pipelineLabelsEdit?: Maybe<PipelineLabel>;
  pipelineLabelsLabel?: Maybe<Scalars['String']['output']>;
  pipelineLabelsRemove?: Maybe<Scalars['JSON']['output']>;
  pipelineTemplatesAdd?: Maybe<PipelineTemplate>;
  pipelineTemplatesDuplicate?: Maybe<PipelineTemplate>;
  pipelineTemplatesEdit?: Maybe<PipelineTemplate>;
  pipelineTemplatesRemove?: Maybe<Scalars['JSON']['output']>;
  pipelinesAdd?: Maybe<Pipeline>;
  pipelinesArchive?: Maybe<Scalars['JSON']['output']>;
  pipelinesCopied?: Maybe<Scalars['JSON']['output']>;
  pipelinesEdit?: Maybe<Pipeline>;
  pipelinesRemove?: Maybe<Scalars['JSON']['output']>;
  pipelinesUpdateOrder?: Maybe<Array<Maybe<Pipeline>>>;
  pipelinesWatch?: Maybe<Pipeline>;
  purchasesAdd?: Maybe<Purchase>;
  purchasesArchive?: Maybe<Scalars['String']['output']>;
  purchasesChange?: Maybe<Purchase>;
  purchasesCopy?: Maybe<Purchase>;
  purchasesCreateProductsData?: Maybe<Scalars['JSON']['output']>;
  purchasesDeleteProductData?: Maybe<Scalars['JSON']['output']>;
  purchasesEdit?: Maybe<Purchase>;
  purchasesEditProductData?: Maybe<Scalars['JSON']['output']>;
  purchasesRemove?: Maybe<Purchase>;
  purchasesWatch?: Maybe<Purchase>;
  resetPassword?: Maybe<Scalars['JSON']['output']>;
  risksAdd?: Maybe<Risk>;
  risksEdit?: Maybe<Risk>;
  risksRemove?: Maybe<Scalars['String']['output']>;
  robotEntriesMarkAsNotified?: Maybe<Array<Maybe<RobotEntry>>>;
  stagesEdit?: Maybe<Stage>;
  stagesRemove?: Maybe<Scalars['JSON']['output']>;
  stagesSortItems?: Maybe<Scalars['String']['output']>;
  stagesUpdateOrder?: Maybe<Array<Maybe<Stage>>>;
  structuresAdd?: Maybe<Structure>;
  structuresEdit?: Maybe<Structure>;
  structuresRemove?: Maybe<Scalars['JSON']['output']>;
  tasksAdd?: Maybe<Task>;
  tasksArchive?: Maybe<Scalars['String']['output']>;
  tasksChange?: Maybe<Task>;
  tasksCopy?: Maybe<Task>;
  tasksEdit?: Maybe<Task>;
  tasksRemove?: Maybe<Task>;
  tasksWatch?: Maybe<Task>;
  ticketsAdd?: Maybe<Ticket>;
  ticketsArchive?: Maybe<Scalars['String']['output']>;
  ticketsChange?: Maybe<Ticket>;
  ticketsCopy?: Maybe<Ticket>;
  ticketsEdit?: Maybe<Ticket>;
  ticketsRemove?: Maybe<Ticket>;
  ticketsWatch?: Maybe<Ticket>;
  unitsAdd?: Maybe<Unit>;
  unitsEdit?: Maybe<Unit>;
  unitsRemove?: Maybe<Scalars['JSON']['output']>;
  usersChangePassword?: Maybe<User>;
  usersConfigEmailSignatures?: Maybe<User>;
  usersConfigGetNotificationByEmail?: Maybe<User>;
  usersConfirmInvitation?: Maybe<User>;
  usersCreateOwner?: Maybe<Scalars['String']['output']>;
  usersEdit?: Maybe<User>;
  usersEditProfile?: Maybe<User>;
  usersGroupsAdd?: Maybe<UsersGroup>;
  usersGroupsCopy?: Maybe<UsersGroup>;
  usersGroupsEdit?: Maybe<UsersGroup>;
  usersGroupsRemove?: Maybe<Scalars['JSON']['output']>;
  usersInvite?: Maybe<Scalars['Boolean']['output']>;
  usersResendInvitation?: Maybe<Scalars['String']['output']>;
  usersResetMemberPassword?: Maybe<User>;
  usersSeenOnBoard?: Maybe<User>;
  usersSetActiveStatus?: Maybe<User>;
};

export type MutationAppsAddArgs = {
  expireDate?: InputMaybe<Scalars['Date']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  userGroupId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationAppsEditArgs = {
  _id: Scalars['String']['input'];
  expireDate?: InputMaybe<Scalars['Date']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  userGroupId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationAppsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationBoardItemUpdateTimeTrackingArgs = {
  _id: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
  timeSpent: Scalars['Int']['input'];
  type: Scalars['String']['input'];
};

export type MutationBoardItemsSaveForGanttTimelineArgs = {
  items?: InputMaybe<Scalars['JSON']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  type: Scalars['String']['input'];
};

export type MutationBoardsAddArgs = {
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type MutationBoardsEditArgs = {
  _id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type MutationBoardsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationBranchesAddArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  coordinate?: InputMaybe<CoordinateInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<AttachmentInput>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  radius?: InputMaybe<Scalars['Int']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationBranchesEditArgs = {
  _id: Scalars['String']['input'];
  address?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  coordinate?: InputMaybe<CoordinateInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<AttachmentInput>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  radius?: InputMaybe<Scalars['Int']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationBranchesRemoveArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationBrandsAddArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  emailConfig?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
};

export type MutationBrandsEditArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  emailConfig?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
};

export type MutationBrandsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationChecklistItemsAddArgs = {
  checklistId?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  isChecked?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationChecklistItemsEditArgs = {
  _id: Scalars['String']['input'];
  checklistId?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  isChecked?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationChecklistItemsOrderArgs = {
  _id: Scalars['String']['input'];
  destinationIndex?: InputMaybe<Scalars['Int']['input']>;
};

export type MutationChecklistItemsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationChecklistsAddArgs = {
  contentType?: InputMaybe<Scalars['String']['input']>;
  contentTypeId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type MutationChecklistsEditArgs = {
  _id: Scalars['String']['input'];
  contentType?: InputMaybe<Scalars['String']['input']>;
  contentTypeId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type MutationChecklistsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationClientPortalCommentsAddArgs = {
  content: Scalars['String']['input'];
  type: Scalars['String']['input'];
  typeId: Scalars['String']['input'];
  userType: Scalars['String']['input'];
};

export type MutationClientPortalCommentsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationClientPortalConfigUpdateArgs = {
  config: ClientPortalConfigInput;
};

export type MutationClientPortalConfirmInvitationArgs = {
  password?: InputMaybe<Scalars['String']['input']>;
  passwordConfirmation?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type MutationClientPortalCreateCardArgs = {
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  productsData?: InputMaybe<Scalars['JSON']['input']>;
  stageId: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['Date']['input']>;
  subject: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type MutationClientPortalFacebookAuthenticationArgs = {
  accessToken?: InputMaybe<Scalars['String']['input']>;
  clientPortalId: Scalars['String']['input'];
};

export type MutationClientPortalFieldConfigsEditArgs = {
  allowedClientPortalIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  fieldId: Scalars['String']['input'];
  requiredOn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationClientPortalFieldConfigsRemoveArgs = {
  fieldId: Scalars['String']['input'];
};

export type MutationClientPortalForgotPasswordArgs = {
  clientPortalId: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type MutationClientPortalGoogleAuthenticationArgs = {
  clientPortalId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
};

export type MutationClientPortalLoginArgs = {
  clientPortalId: Scalars['String']['input'];
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  login: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationClientPortalLoginWithPhoneArgs = {
  clientPortalId: Scalars['String']['input'];
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
};

export type MutationClientPortalLoginWithSocialPayArgs = {
  clientPortalId: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type MutationClientPortalNotificationsMarkAsReadArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  markAll?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationClientPortalNotificationsRemoveArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationClientPortalRegisterArgs = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  clientPortalId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  companyRegistrationNumber?: InputMaybe<Scalars['String']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type MutationClientPortalRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationClientPortalResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type MutationClientPortalResetPasswordWithCodeArgs = {
  code: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type MutationClientPortalSendNotificationArgs = {
  content?: InputMaybe<Scalars['String']['input']>;
  eventData?: InputMaybe<Scalars['JSON']['input']>;
  isMobile?: InputMaybe<Scalars['Boolean']['input']>;
  receivers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type MutationClientPortalUpdateUserArgs = {
  _id: Scalars['String']['input'];
  doc: ClientPortalUserUpdate;
};

export type MutationClientPortalUserAssignCompanyArgs = {
  erxesCompanyId: Scalars['String']['input'];
  erxesCustomerId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type MutationClientPortalUserChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type MutationClientPortalUserUpdateNotificationSettingsArgs = {
  configs?: InputMaybe<Array<InputMaybe<NotificationConfigInput>>>;
  receiveByEmail?: InputMaybe<Scalars['Boolean']['input']>;
  receiveBySms?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationClientPortalUsersChangeVerificationStatusArgs = {
  status: ClientPortalUserVerificationStatus;
  userId: Scalars['String']['input'];
};

export type MutationClientPortalUsersEditArgs = {
  _id: Scalars['String']['input'];
  avatar?: InputMaybe<Scalars['String']['input']>;
  clientPortalId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  companyRegistrationNumber?: InputMaybe<Scalars['String']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type MutationClientPortalUsersInviteArgs = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  clientPortalId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  companyRegistrationNumber?: InputMaybe<Scalars['String']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type MutationClientPortalUsersRemoveArgs = {
  clientPortalUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationClientPortalUsersReplacePhoneArgs = {
  clientPortalId: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type MutationClientPortalUsersSendVerificationRequestArgs = {
  attachments: Array<InputMaybe<AttachmentInput>>;
  clientPortalId: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  login: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationClientPortalUsersVerifyArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
  userIds: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationClientPortalUsersVerifyPhoneArgs = {
  code: Scalars['String']['input'];
};

export type MutationClientPortalVerifyOtpArgs = {
  emailOtp?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phoneOtp?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};

export type MutationCompaniesAddArgs = {
  addresses?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  industry?: InputMaybe<Scalars['String']['input']>;
  isSubscribed?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  names?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  parentCompanyId?: InputMaybe<Scalars['String']['input']>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  primaryAddress?: InputMaybe<Scalars['JSON']['input']>;
  primaryEmail?: InputMaybe<Scalars['String']['input']>;
  primaryName?: InputMaybe<Scalars['String']['input']>;
  primaryPhone?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCompaniesEditArgs = {
  _id: Scalars['String']['input'];
  addresses?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  industry?: InputMaybe<Scalars['String']['input']>;
  isSubscribed?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  names?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  parentCompanyId?: InputMaybe<Scalars['String']['input']>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  primaryAddress?: InputMaybe<Scalars['JSON']['input']>;
  primaryEmail?: InputMaybe<Scalars['String']['input']>;
  primaryName?: InputMaybe<Scalars['String']['input']>;
  primaryPhone?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCompaniesEditByFieldArgs = {
  doc?: InputMaybe<Scalars['JSON']['input']>;
  selector?: InputMaybe<Scalars['JSON']['input']>;
};

export type MutationCompaniesMergeArgs = {
  companyFields?: InputMaybe<Scalars['JSON']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationCompaniesRemoveArgs = {
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationConfigsActivateInstallationArgs = {
  hostname: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type MutationConfigsManagePluginInstallArgs = {
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type MutationConfigsUpdateArgs = {
  configsMap: Scalars['JSON']['input'];
};

export type MutationConformityAddArgs = {
  mainType?: InputMaybe<Scalars['String']['input']>;
  mainTypeId?: InputMaybe<Scalars['String']['input']>;
  relType?: InputMaybe<Scalars['String']['input']>;
  relTypeId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationConformityEditArgs = {
  mainType?: InputMaybe<Scalars['String']['input']>;
  mainTypeId?: InputMaybe<Scalars['String']['input']>;
  relType?: InputMaybe<Scalars['String']['input']>;
  relTypeIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationCustomersAddArgs = {
  addresses?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  birthDate?: InputMaybe<Scalars['Date']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  emailValidationStatus?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  hasAuthority?: InputMaybe<Scalars['String']['input']>;
  isSubscribed?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  leadStatus?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  phoneValidationStatus?: InputMaybe<Scalars['String']['input']>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  position?: InputMaybe<Scalars['String']['input']>;
  primaryAddress?: InputMaybe<Scalars['JSON']['input']>;
  primaryEmail?: InputMaybe<Scalars['String']['input']>;
  primaryPhone?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['Int']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCustomersChangeStateArgs = {
  _id: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type MutationCustomersChangeStateBulkArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  value: Scalars['String']['input'];
};

export type MutationCustomersChangeVerificationStatusArgs = {
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type MutationCustomersEditArgs = {
  _id: Scalars['String']['input'];
  addresses?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  birthDate?: InputMaybe<Scalars['Date']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  emailValidationStatus?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  hasAuthority?: InputMaybe<Scalars['String']['input']>;
  isSubscribed?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  leadStatus?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  phoneValidationStatus?: InputMaybe<Scalars['String']['input']>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  position?: InputMaybe<Scalars['String']['input']>;
  primaryAddress?: InputMaybe<Scalars['JSON']['input']>;
  primaryEmail?: InputMaybe<Scalars['String']['input']>;
  primaryPhone?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['Int']['input']>;
};

export type MutationCustomersEditByFieldArgs = {
  doc?: InputMaybe<Scalars['JSON']['input']>;
  selector?: InputMaybe<Scalars['JSON']['input']>;
};

export type MutationCustomersMergeArgs = {
  customerFields?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationCustomersRemoveArgs = {
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationCustomersVerifyArgs = {
  verificationType: Scalars['String']['input'];
};

export type MutationDealsAddArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  paymentsData?: InputMaybe<Scalars['JSON']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  productsData?: InputMaybe<Scalars['JSON']['input']>;
  reminderMinute?: InputMaybe<Scalars['Int']['input']>;
  sourceConversationIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationDealsArchiveArgs = {
  proccessId?: InputMaybe<Scalars['String']['input']>;
  stageId: Scalars['String']['input'];
};

export type MutationDealsChangeArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  destinationStageId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
  sourceStageId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDealsCopyArgs = {
  _id: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDealsCreateProductsDataArgs = {
  dealId?: InputMaybe<Scalars['String']['input']>;
  docs?: InputMaybe<Scalars['JSON']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDealsDeleteProductDataArgs = {
  dataId?: InputMaybe<Scalars['String']['input']>;
  dealId?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDealsEditArgs = {
  _id: Scalars['String']['input'];
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  paymentsData?: InputMaybe<Scalars['JSON']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  productsData?: InputMaybe<Scalars['JSON']['input']>;
  reminderMinute?: InputMaybe<Scalars['Int']['input']>;
  sourceConversationIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationDealsEditProductDataArgs = {
  dataId?: InputMaybe<Scalars['String']['input']>;
  dealId?: InputMaybe<Scalars['String']['input']>;
  doc?: InputMaybe<Scalars['JSON']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDealsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationDealsWatchArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  isAdd?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationDepartmentsAddArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationDepartmentsEditArgs = {
  _id: Scalars['String']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationDepartmentsRemoveArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationFieldsAddArgs = {
  associatedFieldId?: InputMaybe<Scalars['String']['input']>;
  canHide?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  contentType: Scalars['String']['input'];
  contentTypeId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['String']['input']>;
  isRequired?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleToCreate?: InputMaybe<Scalars['Boolean']['input']>;
  locationOptions?: InputMaybe<Array<InputMaybe<LocationOptionInput>>>;
  logicAction?: InputMaybe<Scalars['String']['input']>;
  logics?: InputMaybe<Array<InputMaybe<LogicInput>>>;
  objectListConfigs?: InputMaybe<Array<InputMaybe<ObjectListConfigInput>>>;
  options?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Scalars['Int']['input']>;
  searchable?: InputMaybe<Scalars['Boolean']['input']>;
  showInCard?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  validation?: InputMaybe<Scalars['String']['input']>;
};

export type MutationFieldsBulkAddAndEditArgs = {
  addingFields?: InputMaybe<Array<InputMaybe<FieldItem>>>;
  contentType: Scalars['String']['input'];
  contentTypeId?: InputMaybe<Scalars['String']['input']>;
  editingFields?: InputMaybe<Array<InputMaybe<FieldItem>>>;
};

export type MutationFieldsEditArgs = {
  _id: Scalars['String']['input'];
  associatedFieldId?: InputMaybe<Scalars['String']['input']>;
  canHide?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['String']['input']>;
  isRequired?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleToCreate?: InputMaybe<Scalars['Boolean']['input']>;
  locationOptions?: InputMaybe<Array<InputMaybe<LocationOptionInput>>>;
  logicAction?: InputMaybe<Scalars['String']['input']>;
  logics?: InputMaybe<Array<InputMaybe<LogicInput>>>;
  objectListConfigs?: InputMaybe<Array<InputMaybe<ObjectListConfigInput>>>;
  options?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Scalars['Int']['input']>;
  searchable?: InputMaybe<Scalars['Boolean']['input']>;
  showInCard?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  validation?: InputMaybe<Scalars['String']['input']>;
};

export type MutationFieldsGroupsAddArgs = {
  alwaysOpen?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  config?: InputMaybe<Scalars['JSON']['input']>;
  contentType?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isMultiple?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleInDetail?: InputMaybe<Scalars['Boolean']['input']>;
  logicAction?: InputMaybe<Scalars['String']['input']>;
  logics?: InputMaybe<Array<InputMaybe<LogicInput>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationFieldsGroupsEditArgs = {
  _id: Scalars['String']['input'];
  alwaysOpen?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  config?: InputMaybe<Scalars['JSON']['input']>;
  contentType?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isMultiple?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleInDetail?: InputMaybe<Scalars['Boolean']['input']>;
  logicAction?: InputMaybe<Scalars['String']['input']>;
  logics?: InputMaybe<Array<InputMaybe<LogicInput>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationFieldsGroupsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationFieldsGroupsUpdateOrderArgs = {
  orders?: InputMaybe<Array<InputMaybe<OrderItem>>>;
};

export type MutationFieldsGroupsUpdateVisibleArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleInDetail?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationFieldsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationFieldsUpdateOrderArgs = {
  orders?: InputMaybe<Array<InputMaybe<OrderItem>>>;
};

export type MutationFieldsUpdateSystemFieldsArgs = {
  _id: Scalars['String']['input'];
  isRequired?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleToCreate?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationFieldsUpdateVisibleArgs = {
  _id: Scalars['String']['input'];
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleInDetail?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};

export type MutationFormSubmissionsEditArgs = {
  contentTypeId: Scalars['String']['input'];
  customerId: Scalars['String']['input'];
  submissions?: InputMaybe<Array<InputMaybe<FormSubmissionInput>>>;
};

export type MutationFormSubmissionsRemoveArgs = {
  contentTypeId: Scalars['String']['input'];
  customerId: Scalars['String']['input'];
};

export type MutationFormSubmissionsSaveArgs = {
  contentType?: InputMaybe<Scalars['String']['input']>;
  contentTypeId?: InputMaybe<Scalars['String']['input']>;
  formId?: InputMaybe<Scalars['String']['input']>;
  formSubmissions?: InputMaybe<Scalars['JSON']['input']>;
};

export type MutationFormsAddArgs = {
  buttonText?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  googleMapApiKey?: InputMaybe<Scalars['String']['input']>;
  numberOfPages?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type MutationFormsEditArgs = {
  _id: Scalars['String']['input'];
  buttonText?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  googleMapApiKey?: InputMaybe<Scalars['String']['input']>;
  numberOfPages?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type MutationGrowthHacksAddArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  confidence?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  ease?: InputMaybe<Scalars['Int']['input']>;
  hackStages?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  impact?: InputMaybe<Scalars['Int']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  reach?: InputMaybe<Scalars['Int']['input']>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type MutationGrowthHacksArchiveArgs = {
  proccessId?: InputMaybe<Scalars['String']['input']>;
  stageId: Scalars['String']['input'];
};

export type MutationGrowthHacksChangeArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  destinationStageId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
  sourceStageId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationGrowthHacksCopyArgs = {
  _id: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationGrowthHacksEditArgs = {
  _id: Scalars['String']['input'];
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  confidence?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  ease?: InputMaybe<Scalars['Int']['input']>;
  hackStages?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  impact?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  reach?: InputMaybe<Scalars['Int']['input']>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type MutationGrowthHacksRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationGrowthHacksVoteArgs = {
  _id: Scalars['String']['input'];
  isVote?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationGrowthHacksWatchArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  isAdd?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationInsuranceCategoryAddArgs = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  riskIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationInsuranceCategoryEditArgs = {
  _id: Scalars['ID']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  riskIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationInsuranceCategoryRemoveArgs = {
  _id: Scalars['ID']['input'];
};

export type MutationInsuranceItemAddArgs = {
  doc?: InputMaybe<InsuranceItemInput>;
};

export type MutationInsuranceItemEditArgs = {
  _id: Scalars['ID']['input'];
  doc?: InputMaybe<InsuranceItemInput>;
};

export type MutationInsuranceItemRemoveArgs = {
  _id: Scalars['ID']['input'];
};

export type MutationInsurancePackageAddArgs = {
  input: InsurancePackageInput;
};

export type MutationInsurancePackageEditArgs = {
  _id: Scalars['ID']['input'];
  input: InsurancePackageInput;
};

export type MutationInsurancePackageRemoveArgs = {
  _id: Scalars['ID']['input'];
};

export type MutationInsuranceProductsAddArgs = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  code: Scalars['String']['input'];
  companyProductConfigs?: InputMaybe<
    Array<InputMaybe<CompanyProductConfigInput>>
  >;
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  riskConfigs?: InputMaybe<Array<InputMaybe<RiskConfigInput>>>;
};

export type MutationInsuranceProductsEditArgs = {
  _id: Scalars['ID']['input'];
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  companyProductConfigs?: InputMaybe<
    Array<InputMaybe<CompanyProductConfigInput>>
  >;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  riskConfigs?: InputMaybe<Array<InputMaybe<RiskConfigInput>>>;
};

export type MutationInsuranceProductsRemoveArgs = {
  _id: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationManageExpensesArgs = {
  costObjects?: InputMaybe<Array<InputMaybe<CostObjectInput>>>;
};

export type MutationOnboardingCompleteShowStepArgs = {
  step?: InputMaybe<Scalars['String']['input']>;
};

export type MutationPermissionsAddArgs = {
  actions: Array<Scalars['String']['input']>;
  allowed?: InputMaybe<Scalars['Boolean']['input']>;
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  module: Scalars['String']['input'];
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationPermissionsRemoveArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationPipelineLabelsAddArgs = {
  colorCode: Scalars['String']['input'];
  name: Scalars['String']['input'];
  pipelineId: Scalars['String']['input'];
};

export type MutationPipelineLabelsEditArgs = {
  _id: Scalars['String']['input'];
  colorCode: Scalars['String']['input'];
  name: Scalars['String']['input'];
  pipelineId: Scalars['String']['input'];
};

export type MutationPipelineLabelsLabelArgs = {
  labelIds: Array<Scalars['String']['input']>;
  pipelineId: Scalars['String']['input'];
  targetId: Scalars['String']['input'];
};

export type MutationPipelineLabelsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationPipelineTemplatesAddArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  stages?: InputMaybe<Array<InputMaybe<PipelineTemplateStageInput>>>;
  type: Scalars['String']['input'];
};

export type MutationPipelineTemplatesDuplicateArgs = {
  _id: Scalars['String']['input'];
};

export type MutationPipelineTemplatesEditArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  stages?: InputMaybe<Array<InputMaybe<PipelineTemplateStageInput>>>;
  type: Scalars['String']['input'];
};

export type MutationPipelineTemplatesRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationPipelinesAddArgs = {
  bgColor?: InputMaybe<Scalars['String']['input']>;
  boardId: Scalars['String']['input'];
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['Date']['input']>;
  excludeCheckUserIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  hackScoringType?: InputMaybe<Scalars['String']['input']>;
  isCheckDepartment?: InputMaybe<Scalars['Boolean']['input']>;
  isCheckUser?: InputMaybe<Scalars['Boolean']['input']>;
  memberIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metric?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  numberConfig?: InputMaybe<Scalars['String']['input']>;
  numberSize?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Scalars['JSON']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  tagId?: InputMaybe<Scalars['String']['input']>;
  templateId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
  visibility: Scalars['String']['input'];
};

export type MutationPipelinesArchiveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationPipelinesCopiedArgs = {
  _id: Scalars['String']['input'];
};

export type MutationPipelinesEditArgs = {
  _id: Scalars['String']['input'];
  bgColor?: InputMaybe<Scalars['String']['input']>;
  boardId: Scalars['String']['input'];
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['Date']['input']>;
  excludeCheckUserIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  hackScoringType?: InputMaybe<Scalars['String']['input']>;
  isCheckDepartment?: InputMaybe<Scalars['Boolean']['input']>;
  isCheckUser?: InputMaybe<Scalars['Boolean']['input']>;
  memberIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metric?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  numberConfig?: InputMaybe<Scalars['String']['input']>;
  numberSize?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Scalars['JSON']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  tagId?: InputMaybe<Scalars['String']['input']>;
  templateId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
  visibility: Scalars['String']['input'];
};

export type MutationPipelinesRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationPipelinesUpdateOrderArgs = {
  orders?: InputMaybe<Array<InputMaybe<OrderItem>>>;
};

export type MutationPipelinesWatchArgs = {
  _id: Scalars['String']['input'];
  isAdd?: InputMaybe<Scalars['Boolean']['input']>;
  type: Scalars['String']['input'];
};

export type MutationPurchasesAddArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  expensesData?: InputMaybe<Scalars['JSON']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  paymentsData?: InputMaybe<Scalars['JSON']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  productsData?: InputMaybe<Scalars['JSON']['input']>;
  reminderMinute?: InputMaybe<Scalars['Int']['input']>;
  sourceConversationIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationPurchasesArchiveArgs = {
  proccessId?: InputMaybe<Scalars['String']['input']>;
  stageId: Scalars['String']['input'];
};

export type MutationPurchasesChangeArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  destinationStageId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
  sourceStageId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationPurchasesCopyArgs = {
  _id: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationPurchasesCreateProductsDataArgs = {
  docs?: InputMaybe<Scalars['JSON']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  purchaseId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationPurchasesDeleteProductDataArgs = {
  dataId?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  purchaseId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationPurchasesEditArgs = {
  _id: Scalars['String']['input'];
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  expensesData?: InputMaybe<Scalars['JSON']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  paymentsData?: InputMaybe<Scalars['JSON']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  productsData?: InputMaybe<Scalars['JSON']['input']>;
  reminderMinute?: InputMaybe<Scalars['Int']['input']>;
  sourceConversationIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationPurchasesEditProductDataArgs = {
  dataId?: InputMaybe<Scalars['String']['input']>;
  doc?: InputMaybe<Scalars['JSON']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  purchaseId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationPurchasesRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationPurchasesWatchArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  isAdd?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type MutationRisksAddArgs = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type MutationRisksEditArgs = {
  _id: Scalars['ID']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type MutationRisksRemoveArgs = {
  _id: Scalars['ID']['input'];
};

export type MutationRobotEntriesMarkAsNotifiedArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
};

export type MutationStagesEditArgs = {
  _id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type MutationStagesRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationStagesSortItemsArgs = {
  proccessId?: InputMaybe<Scalars['String']['input']>;
  sortType?: InputMaybe<Scalars['String']['input']>;
  stageId: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};

export type MutationStagesUpdateOrderArgs = {
  orders?: InputMaybe<Array<InputMaybe<OrderItem>>>;
};

export type MutationStructuresAddArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
  coordinate?: InputMaybe<CoordinateInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<AttachmentInput>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type MutationStructuresEditArgs = {
  _id: Scalars['String']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  coordinate?: InputMaybe<CoordinateInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<AttachmentInput>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type MutationStructuresRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationTasksAddArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  reminderMinute?: InputMaybe<Scalars['Int']['input']>;
  sourceConversationIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationTasksArchiveArgs = {
  proccessId?: InputMaybe<Scalars['String']['input']>;
  stageId: Scalars['String']['input'];
};

export type MutationTasksChangeArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  destinationStageId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
  sourceStageId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationTasksCopyArgs = {
  _id: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationTasksEditArgs = {
  _id: Scalars['String']['input'];
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  reminderMinute?: InputMaybe<Scalars['Int']['input']>;
  sourceConversationIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationTasksRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationTasksWatchArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  isAdd?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationTicketsAddArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  reminderMinute?: InputMaybe<Scalars['Int']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  sourceConversationIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationTicketsArchiveArgs = {
  proccessId?: InputMaybe<Scalars['String']['input']>;
  stageId: Scalars['String']['input'];
};

export type MutationTicketsChangeArgs = {
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  destinationStageId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
  sourceStageId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationTicketsCopyArgs = {
  _id: Scalars['String']['input'];
  proccessId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationTicketsEditArgs = {
  _id: Scalars['String']['input'];
  aboveItemId?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  isComplete?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  proccessId?: InputMaybe<Scalars['String']['input']>;
  reminderMinute?: InputMaybe<Scalars['Int']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  sourceConversationIds?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationTicketsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationTicketsWatchArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  isAdd?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationUnitsAddArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationUnitsEditArgs = {
  _id: Scalars['String']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  supervisorId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationUnitsRemoveArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MutationUsersChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type MutationUsersConfigEmailSignaturesArgs = {
  signatures?: InputMaybe<Array<InputMaybe<EmailSignature>>>;
};

export type MutationUsersConfigGetNotificationByEmailArgs = {
  isAllowed?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationUsersConfirmInvitationArgs = {
  fullName?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  passwordConfirmation?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUsersCreateOwnerArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  purpose?: InputMaybe<Scalars['String']['input']>;
  subscribeEmail?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationUsersEditArgs = {
  _id: Scalars['String']['input'];
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  brandIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  channelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customFieldsData?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  details?: InputMaybe<UserDetails>;
  email?: InputMaybe<Scalars['String']['input']>;
  employeeId?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUsersEditProfileArgs = {
  details?: InputMaybe<UserDetails>;
  email: Scalars['String']['input'];
  employeeId?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Scalars['JSON']['input']>;
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type MutationUsersGroupsAddArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  memberIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
};

export type MutationUsersGroupsCopyArgs = {
  _id: Scalars['String']['input'];
  memberIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MutationUsersGroupsEditArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  memberIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
};

export type MutationUsersGroupsRemoveArgs = {
  _id: Scalars['String']['input'];
};

export type MutationUsersInviteArgs = {
  entries?: InputMaybe<Array<InputMaybe<InvitationEntry>>>;
};

export type MutationUsersResendInvitationArgs = {
  email: Scalars['String']['input'];
};

export type MutationUsersResetMemberPasswordArgs = {
  _id: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type MutationUsersSetActiveStatusArgs = {
  _id: Scalars['String']['input'];
};

export type NotificationConfig = {
  __typename?: 'NotificationConfig';
  isAllowed?: Maybe<Scalars['Boolean']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  notifType?: Maybe<Scalars['String']['output']>;
};

export type NotificationConfigInput = {
  isAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  notifType?: InputMaybe<Scalars['String']['input']>;
};

export enum NotificationType {
  Engage = 'engage',
  System = 'system'
}

export type OtpConfig = {
  __typename?: 'OTPConfig';
  codeLength?: Maybe<Scalars['Int']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  expireAfter?: Maybe<Scalars['Int']['output']>;
  loginWithOTP?: Maybe<Scalars['Boolean']['output']>;
  smsTransporterType?: Maybe<Scalars['String']['output']>;
};

export type OtpConfigInput = {
  codeLength?: InputMaybe<Scalars['Int']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  expireAfter?: InputMaybe<Scalars['Int']['input']>;
  loginWithOTP?: InputMaybe<Scalars['Boolean']['input']>;
  smsTransporterType?: InputMaybe<Scalars['String']['input']>;
};

export type ObjectListConfig = {
  __typename?: 'ObjectListConfig';
  key?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type OnboardingGetAvailableFeaturesResponse = {
  __typename?: 'OnboardingGetAvailableFeaturesResponse';
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  settings?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  showSettings?: Maybe<Scalars['Boolean']['output']>;
};

export type OnboardingHistory = {
  __typename?: 'OnboardingHistory';
  _id?: Maybe<Scalars['String']['output']>;
  completedSteps?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isCompleted?: Maybe<Scalars['Boolean']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type OnboardingNotification = {
  __typename?: 'OnboardingNotification';
  type?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type OrderItem = {
  _id: Scalars['String']['input'];
  order: Scalars['Int']['input'];
};

export type PasswordVerificationConfig = {
  __typename?: 'PasswordVerificationConfig';
  emailContent?: Maybe<Scalars['String']['output']>;
  emailSubject?: Maybe<Scalars['String']['output']>;
  smsContent?: Maybe<Scalars['String']['output']>;
  verifyByOTP?: Maybe<Scalars['Boolean']['output']>;
};

export type Permission = {
  __typename?: 'Permission';
  _id: Scalars['String']['output'];
  action?: Maybe<Scalars['String']['output']>;
  allowed?: Maybe<Scalars['Boolean']['output']>;
  group?: Maybe<UsersGroup>;
  groupId?: Maybe<Scalars['String']['output']>;
  module?: Maybe<Scalars['String']['output']>;
  requiredActions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type PermissionAction = {
  __typename?: 'PermissionAction';
  description?: Maybe<Scalars['String']['output']>;
  module?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type PermissionModule = {
  __typename?: 'PermissionModule';
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Pipeline = {
  __typename?: 'Pipeline';
  _id: Scalars['String']['output'];
  bgColor?: Maybe<Scalars['String']['output']>;
  boardId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<User>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  endDate?: Maybe<Scalars['Date']['output']>;
  excludeCheckUserIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  hackScoringType?: Maybe<Scalars['String']['output']>;
  isCheckDepartment?: Maybe<Scalars['Boolean']['output']>;
  isCheckUser?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  itemsTotalCount?: Maybe<Scalars['Int']['output']>;
  memberIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  members?: Maybe<Array<Maybe<User>>>;
  metric?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  numberConfig?: Maybe<Scalars['String']['output']>;
  numberSize?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagId?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  visibility: Scalars['String']['output'];
};

export type PipelineChangeResponse = {
  __typename?: 'PipelineChangeResponse';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['JSON']['output']>;
  proccessId?: Maybe<Scalars['String']['output']>;
};

export type PipelineLabel = {
  __typename?: 'PipelineLabel';
  _id: Scalars['String']['output'];
  colorCode?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  pipelineId?: Maybe<Scalars['String']['output']>;
};

export type PipelineTemplate = {
  __typename?: 'PipelineTemplate';
  _id: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isDefinedByErxes?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  stages?: Maybe<Array<Maybe<PipelineTemplateStage>>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type PipelineTemplateStage = {
  __typename?: 'PipelineTemplateStage';
  _id: Scalars['String']['output'];
  formId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  order?: Maybe<Scalars['Int']['output']>;
};

export type PipelineTemplateStageInput = {
  _id: Scalars['String']['input'];
  formId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type ProductField = {
  productId?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type ProductsDataChangeResponse = {
  __typename?: 'ProductsDataChangeResponse';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['JSON']['output']>;
  proccessId?: Maybe<Scalars['String']['output']>;
};

export type Purchase = {
  __typename?: 'Purchase';
  _id: Scalars['String']['output'];
  amount?: Maybe<Scalars['JSON']['output']>;
  assignedUserIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  assignedUsers?: Maybe<Array<Maybe<User>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  boardId?: Maybe<Scalars['String']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  companies?: Maybe<Array<Maybe<Company>>>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<User>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Array<Maybe<Customer>>>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  description?: Maybe<Scalars['String']['output']>;
  expensesData?: Maybe<Scalars['JSON']['output']>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labelIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  labels?: Maybe<Array<Maybe<PipelineLabel>>>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  modifiedBy?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Float']['output']>;
  paymentsData?: Maybe<Scalars['JSON']['output']>;
  pipeline?: Maybe<Pipeline>;
  priority?: Maybe<Scalars['String']['output']>;
  products?: Maybe<Scalars['JSON']['output']>;
  productsData?: Maybe<Scalars['JSON']['output']>;
  reminderMinute?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  stage?: Maybe<Stage>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  stageId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  timeTrack?: Maybe<TimeTrack>;
  unUsedAmount?: Maybe<Scalars['JSON']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type PurchaseListItem = {
  __typename?: 'PurchaseListItem';
  _id: Scalars['String']['output'];
  amount?: Maybe<Scalars['JSON']['output']>;
  assignedUsers?: Maybe<Scalars['JSON']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  branches?: Maybe<Array<Maybe<Branch>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  companies?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUserId?: Maybe<Scalars['String']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Scalars['JSON']['output']>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  departments?: Maybe<Array<Maybe<Department>>>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labels?: Maybe<Scalars['JSON']['output']>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  products?: Maybe<Scalars['JSON']['output']>;
  relations?: Maybe<Scalars['JSON']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  stage?: Maybe<Scalars['JSON']['output']>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  unUsedAmount?: Maybe<Scalars['JSON']['output']>;
};

export type PurchaseProductField = {
  productId?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type PurchaseTotalCurrency = {
  __typename?: 'PurchaseTotalCurrency';
  amount?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type PurchaseTotalForType = {
  __typename?: 'PurchaseTotalForType';
  _id?: Maybe<Scalars['String']['output']>;
  currencies?: Maybe<Array<Maybe<PurchaseTotalCurrency>>>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  activityLogs?: Maybe<Array<Maybe<ActivityLog>>>;
  activityLogsByAction?: Maybe<ActivityLogByActionResponse>;
  allBrands?: Maybe<Array<Maybe<Brand>>>;
  allUsers?: Maybe<Array<Maybe<User>>>;
  appDetail?: Maybe<App>;
  apps?: Maybe<Array<Maybe<App>>>;
  appsTotalCount?: Maybe<Scalars['Int']['output']>;
  archivedDeals?: Maybe<Array<Maybe<Deal>>>;
  archivedDealsCount?: Maybe<Scalars['Int']['output']>;
  archivedGrowthHacks?: Maybe<Array<Maybe<GrowthHack>>>;
  archivedGrowthHacksCount?: Maybe<Scalars['Int']['output']>;
  archivedPurchases?: Maybe<Array<Maybe<Purchase>>>;
  archivedPurchasesCount?: Maybe<Scalars['Int']['output']>;
  archivedStages?: Maybe<Array<Maybe<Stage>>>;
  archivedStagesCount?: Maybe<Scalars['Int']['output']>;
  archivedTasks?: Maybe<Array<Maybe<Task>>>;
  archivedTasksCount?: Maybe<Scalars['Int']['output']>;
  archivedTickets?: Maybe<Array<Maybe<Ticket>>>;
  archivedTicketsCount?: Maybe<Scalars['Int']['output']>;
  boardContentTypeDetail?: Maybe<Scalars['JSON']['output']>;
  boardCounts?: Maybe<Array<Maybe<BoardCount>>>;
  boardDetail?: Maybe<Board>;
  boardGetLast?: Maybe<Board>;
  boardLogs?: Maybe<Scalars['JSON']['output']>;
  boards?: Maybe<Array<Maybe<Board>>>;
  branchDetail?: Maybe<Branch>;
  branches?: Maybe<Array<Maybe<Branch>>>;
  branchesMain?: Maybe<BranchListQueryResponse>;
  brandDetail?: Maybe<Brand>;
  brands?: Maybe<Array<Maybe<Brand>>>;
  brandsGetLast?: Maybe<Brand>;
  brandsTotalCount?: Maybe<Scalars['Int']['output']>;
  cardsFields?: Maybe<Scalars['JSON']['output']>;
  checkDiscount?: Maybe<Scalars['JSON']['output']>;
  checkFreeTimes?: Maybe<Scalars['JSON']['output']>;
  checklistDetail?: Maybe<Checklist>;
  checklists?: Maybe<Array<Maybe<Checklist>>>;
  clientPortalCardUsers?: Maybe<Array<Maybe<ClientPortalUser>>>;
  clientPortalComments?: Maybe<Array<Maybe<ClientPortalComment>>>;
  clientPortalConfigsTotalCount?: Maybe<Scalars['Int']['output']>;
  clientPortalCurrentUser?: Maybe<ClientPortalUser>;
  clientPortalDeals?: Maybe<Array<Maybe<Deal>>>;
  clientPortalFieldConfig?: Maybe<ClientPortalFieldConfig>;
  clientPortalGetAllowedFields?: Maybe<Array<Maybe<Field>>>;
  clientPortalGetConfig?: Maybe<ClientPortal>;
  clientPortalGetConfigByDomain?: Maybe<ClientPortal>;
  clientPortalGetConfigs?: Maybe<Array<Maybe<ClientPortal>>>;
  clientPortalGetLast?: Maybe<ClientPortal>;
  clientPortalGetTaskStages?: Maybe<Array<Maybe<Stage>>>;
  clientPortalGetTasks?: Maybe<Array<Maybe<Task>>>;
  clientPortalNotificationCount?: Maybe<Scalars['Int']['output']>;
  clientPortalNotificationDetail?: Maybe<ClientPortalNotification>;
  clientPortalNotifications?: Maybe<Array<Maybe<ClientPortalNotification>>>;
  clientPortalPurchases?: Maybe<Array<Maybe<Purchase>>>;
  clientPortalTasks?: Maybe<Array<Maybe<Task>>>;
  clientPortalTicket?: Maybe<Ticket>;
  clientPortalTickets?: Maybe<Array<Maybe<Ticket>>>;
  clientPortalUserCounts?: Maybe<Scalars['Int']['output']>;
  clientPortalUserDeals?: Maybe<Array<Maybe<Deal>>>;
  clientPortalUserDetail?: Maybe<ClientPortalUser>;
  clientPortalUserPurchases?: Maybe<Array<Maybe<Purchase>>>;
  clientPortalUserTasks?: Maybe<Array<Maybe<Task>>>;
  clientPortalUserTickets?: Maybe<Array<Maybe<Ticket>>>;
  clientPortalUsers?: Maybe<Array<Maybe<ClientPortalUser>>>;
  clientPortalUsersMain?: Maybe<ClientPortalUsersListResponse>;
  companies?: Maybe<Array<Maybe<Company>>>;
  companiesMain?: Maybe<CompaniesListResponse>;
  companyCounts?: Maybe<Scalars['JSON']['output']>;
  companyDetail?: Maybe<Company>;
  configs?: Maybe<Array<Maybe<Config>>>;
  configsCheckActivateInstallation?: Maybe<Scalars['JSON']['output']>;
  configsCheckPremiumService?: Maybe<Scalars['Boolean']['output']>;
  configsConstants?: Maybe<Scalars['JSON']['output']>;
  configsGetEmailTemplate?: Maybe<Scalars['String']['output']>;
  configsGetEnv?: Maybe<Env>;
  configsGetInstallationStatus?: Maybe<Scalars['JSON']['output']>;
  configsGetValue?: Maybe<Scalars['JSON']['output']>;
  configsGetVersion?: Maybe<Scalars['JSON']['output']>;
  contacts?: Maybe<Array<Maybe<Contacts>>>;
  contactsLogs?: Maybe<Scalars['JSON']['output']>;
  convertToInfo?: Maybe<ConvertTo>;
  costDetail?: Maybe<Scalars['JSON']['output']>;
  costTotalCount?: Maybe<Scalars['JSON']['output']>;
  costs?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  currentUser?: Maybe<User>;
  customerCounts?: Maybe<Scalars['JSON']['output']>;
  customerDetail?: Maybe<Customer>;
  customers?: Maybe<Array<Maybe<Customer>>>;
  customersMain?: Maybe<CustomersListResponse>;
  dealDetail?: Maybe<Deal>;
  deals?: Maybe<Array<Maybe<DealListItem>>>;
  dealsTotalAmounts?: Maybe<Array<Maybe<TotalForType>>>;
  dealsTotalCount?: Maybe<Scalars['Int']['output']>;
  departmentDetail?: Maybe<Department>;
  departments?: Maybe<Array<Maybe<Department>>>;
  departmentsMain?: Maybe<DepartmentListQueryResponse>;
  emailDeliveriesAsLogs?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  emailDeliveryDetail?: Maybe<EmailDelivery>;
  enabledServices?: Maybe<Scalars['JSON']['output']>;
  fields?: Maybe<Array<Maybe<Field>>>;
  fieldsCombinedByContentType?: Maybe<Scalars['JSON']['output']>;
  fieldsDefaultColumnsConfig?: Maybe<Array<Maybe<ColumnConfigItem>>>;
  fieldsGetDetail?: Maybe<Field>;
  fieldsGetRelations?: Maybe<Array<Maybe<Field>>>;
  fieldsGetTypes?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  fieldsGroups?: Maybe<Array<Maybe<FieldsGroup>>>;
  formDetail?: Maybe<Form>;
  formSubmissionDetail?: Maybe<Submission>;
  formSubmissions?: Maybe<Array<Maybe<Submission>>>;
  formSubmissionsTotalCount?: Maybe<Scalars['Int']['output']>;
  forms?: Maybe<Array<Maybe<Form>>>;
  getDbSchemaLabels?: Maybe<Array<Maybe<SchemaField>>>;
  getFieldsInputTypes?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  getSystemFieldsGroup?: Maybe<FieldsGroup>;
  growthHackDetail?: Maybe<GrowthHack>;
  growthHacks?: Maybe<Array<Maybe<GrowthHack>>>;
  growthHacksPriorityMatrix?: Maybe<Scalars['JSON']['output']>;
  growthHacksTotalCount?: Maybe<Scalars['Int']['output']>;
  insuranceCategories?: Maybe<Array<Maybe<InsuranceCategory>>>;
  insuranceCategory?: Maybe<InsuranceCategory>;
  insuranceCategoryList?: Maybe<InsuranceCategoryList>;
  insuranceItem?: Maybe<InsuranceItem>;
  insuranceItemList?: Maybe<InsuranceItemListResult>;
  insuranceItems?: Maybe<Array<Maybe<InsuranceItem>>>;
  insurancePackage?: Maybe<InsurancePackage>;
  insurancePackageList?: Maybe<InsurancePackageList>;
  insurancePackages: Array<InsurancePackage>;
  insuranceProduct?: Maybe<InsuranceProduct>;
  insuranceProductList?: Maybe<InsuranceProductList>;
  insuranceProducts?: Maybe<Array<Maybe<InsuranceProduct>>>;
  insuranceProductsOfVendor?: Maybe<Array<Maybe<InsuranceProductOfVendor>>>;
  itemsCountByAssignedUser?: Maybe<Scalars['JSON']['output']>;
  itemsCountBySegments?: Maybe<Scalars['JSON']['output']>;
  logs?: Maybe<LogList>;
  noDepartmentUsers?: Maybe<Array<Maybe<User>>>;
  onboardingGetAvailableFeatures?: Maybe<
    Array<Maybe<OnboardingGetAvailableFeaturesResponse>>
  >;
  onboardingStepsCompleteness?: Maybe<Scalars['JSON']['output']>;
  permissionActions?: Maybe<Array<Maybe<PermissionAction>>>;
  permissionModules?: Maybe<Array<Maybe<PermissionModule>>>;
  permissions?: Maybe<Array<Maybe<Permission>>>;
  permissionsTotalCount?: Maybe<Scalars['Int']['output']>;
  pipelineAssignedUsers?: Maybe<Array<Maybe<User>>>;
  pipelineDetail?: Maybe<Pipeline>;
  pipelineLabelDetail?: Maybe<PipelineLabel>;
  pipelineLabels?: Maybe<Array<Maybe<PipelineLabel>>>;
  pipelineStateCount?: Maybe<Scalars['JSON']['output']>;
  pipelineTemplateDetail?: Maybe<PipelineTemplate>;
  pipelineTemplates?: Maybe<Array<Maybe<PipelineTemplate>>>;
  pipelineTemplatesTotalCount?: Maybe<Scalars['Int']['output']>;
  pipelines?: Maybe<Array<Maybe<Pipeline>>>;
  purchaseDetail?: Maybe<Purchase>;
  purchasecheckDiscount?: Maybe<Scalars['JSON']['output']>;
  purchases?: Maybe<Array<Maybe<PurchaseListItem>>>;
  purchasesTotalAmounts?: Maybe<Array<Maybe<TotalForType>>>;
  purchasesTotalCount?: Maybe<Scalars['Int']['output']>;
  risk?: Maybe<Risk>;
  risks?: Maybe<Array<Maybe<Risk>>>;
  risksPaginated?: Maybe<RiskPage>;
  robotEntries?: Maybe<Array<Maybe<RobotEntry>>>;
  search?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  stageDetail?: Maybe<Stage>;
  stages?: Maybe<Array<Maybe<Stage>>>;
  structureDetail?: Maybe<Structure>;
  taskDetail?: Maybe<Task>;
  tasks?: Maybe<Array<Maybe<TaskListItem>>>;
  tasksAsLogs?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  tasksTotalCount?: Maybe<Scalars['Int']['output']>;
  ticketDetail?: Maybe<Ticket>;
  tickets?: Maybe<Array<Maybe<TicketListItem>>>;
  ticketsTotalCount?: Maybe<Scalars['Int']['output']>;
  transactionEmailDeliveries?: Maybe<EmailDeliveryList>;
  unitDetail?: Maybe<Unit>;
  units?: Maybe<Array<Maybe<Unit>>>;
  unitsMain?: Maybe<UnitListQueryResponse>;
  userDetail?: Maybe<User>;
  userMovements?: Maybe<Array<Maybe<UserMovement>>>;
  users?: Maybe<Array<Maybe<User>>>;
  usersGroups?: Maybe<Array<Maybe<UsersGroup>>>;
  usersGroupsTotalCount?: Maybe<Scalars['Int']['output']>;
  usersTotalCount?: Maybe<Scalars['Int']['output']>;
};

export type QueryActivityLogsArgs = {
  activityType?: InputMaybe<Scalars['String']['input']>;
  contentId?: InputMaybe<Scalars['String']['input']>;
  contentType: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryActivityLogsByActionArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  contentType?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryAllUsersArgs = {
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryAppDetailArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
};

export type QueryArchivedDealsArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedDealsCountArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedGrowthHacksArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hackStages?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedGrowthHacksCountArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hackStages?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedPurchasesArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedPurchasesCountArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedStagesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  pipelineId: Scalars['String']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryArchivedStagesCountArgs = {
  pipelineId: Scalars['String']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryArchivedTasksArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedTasksCountArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedTicketsArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  sources?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryArchivedTicketsCountArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pipelineId: Scalars['String']['input'];
  priorities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  sources?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryBoardContentTypeDetailArgs = {
  contentId?: InputMaybe<Scalars['String']['input']>;
  contentType?: InputMaybe<Scalars['String']['input']>;
};

export type QueryBoardCountsArgs = {
  type: Scalars['String']['input'];
};

export type QueryBoardDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryBoardGetLastArgs = {
  type: Scalars['String']['input'];
};

export type QueryBoardLogsArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['JSON']['input']>;
  contentId?: InputMaybe<Scalars['String']['input']>;
  contentType?: InputMaybe<Scalars['String']['input']>;
};

export type QueryBoardsArgs = {
  type: Scalars['String']['input'];
};

export type QueryBranchDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryBranchesArgs = {
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  withoutUserFilter?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryBranchesMainArgs = {
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  withoutUserFilter?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryBrandDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryBrandsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCheckDiscountArgs = {
  _id: Scalars['String']['input'];
  products?: InputMaybe<Array<InputMaybe<ProductField>>>;
};

export type QueryCheckFreeTimesArgs = {
  intervals?: InputMaybe<Array<InputMaybe<Interval>>>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryChecklistDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryChecklistsArgs = {
  contentType?: InputMaybe<Scalars['String']['input']>;
  contentTypeId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalCardUsersArgs = {
  contentType: Scalars['String']['input'];
  contentTypeId: Scalars['String']['input'];
  userKind?: InputMaybe<BusinessPortalKind>;
};

export type QueryClientPortalCommentsArgs = {
  type: Scalars['String']['input'];
  typeId: Scalars['String']['input'];
};

export type QueryClientPortalDealsArgs = {
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<ItemDate>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryClientPortalFieldConfigArgs = {
  fieldId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalGetAllowedFieldsArgs = {
  _id: Scalars['String']['input'];
};

export type QueryClientPortalGetConfigArgs = {
  _id: Scalars['String']['input'];
};

export type QueryClientPortalGetConfigsArgs = {
  kind?: InputMaybe<BusinessPortalKind>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryClientPortalGetLastArgs = {
  kind?: InputMaybe<BusinessPortalKind>;
};

export type QueryClientPortalGetTasksArgs = {
  stageId: Scalars['String']['input'];
};

export type QueryClientPortalNotificationCountArgs = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryClientPortalNotificationDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryClientPortalNotificationsArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  notifType?: InputMaybe<NotificationType>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  requireRead?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalPurchasesArgs = {
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<ItemDate>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryClientPortalTasksArgs = {
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<ItemDate>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryClientPortalTicketArgs = {
  _id: Scalars['String']['input'];
};

export type QueryClientPortalTicketsArgs = {
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<ItemDate>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryClientPortalUserCountsArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalUserDealsArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalUserDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryClientPortalUserPurchasesArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalUserTasksArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalUserTicketsArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalUsersArgs = {
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  cpId?: InputMaybe<Scalars['String']['input']>;
  dateFilters?: InputMaybe<Scalars['String']['input']>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryClientPortalUsersMainArgs = {
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  cpId?: InputMaybe<Scalars['String']['input']>;
  dateFilters?: InputMaybe<Scalars['String']['input']>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCompaniesArgs = {
  autoCompletion?: InputMaybe<Scalars['Boolean']['input']>;
  autoCompletionType?: InputMaybe<Scalars['String']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  dateFilters?: InputMaybe<Scalars['String']['input']>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCompaniesMainArgs = {
  autoCompletion?: InputMaybe<Scalars['Boolean']['input']>;
  autoCompletionType?: InputMaybe<Scalars['String']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  dateFilters?: InputMaybe<Scalars['String']['input']>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCompanyCountsArgs = {
  autoCompletion?: InputMaybe<Scalars['Boolean']['input']>;
  autoCompletionType?: InputMaybe<Scalars['String']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  dateFilters?: InputMaybe<Scalars['String']['input']>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  only?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCompanyDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryConfigsCheckActivateInstallationArgs = {
  hostname: Scalars['String']['input'];
};

export type QueryConfigsCheckPremiumServiceArgs = {
  type: Scalars['String']['input'];
};

export type QueryConfigsGetEmailTemplateArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type QueryConfigsGetInstallationStatusArgs = {
  name: Scalars['String']['input'];
};

export type QueryConfigsGetValueArgs = {
  code: Scalars['String']['input'];
};

export type QueryConfigsGetVersionArgs = {
  releaseNotes?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryContactsArgs = {
  fieldsMustExist?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  usageType?: InputMaybe<Scalars['String']['input']>;
};

export type QueryContactsLogsArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['JSON']['input']>;
  contentId?: InputMaybe<Scalars['String']['input']>;
  contentType?: InputMaybe<Scalars['String']['input']>;
};

export type QueryConvertToInfoArgs = {
  conversationId: Scalars['String']['input'];
};

export type QueryCostDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryCustomerCountsArgs = {
  autoCompletion?: InputMaybe<Scalars['Boolean']['input']>;
  autoCompletionType?: InputMaybe<Scalars['String']['input']>;
  birthDate?: InputMaybe<Scalars['Date']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  dateFilters?: InputMaybe<Scalars['String']['input']>;
  emailValidationStatus?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  form?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  integration?: InputMaybe<Scalars['String']['input']>;
  leadStatus?: InputMaybe<Scalars['String']['input']>;
  only?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCustomerDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryCustomersArgs = {
  autoCompletion?: InputMaybe<Scalars['Boolean']['input']>;
  autoCompletionType?: InputMaybe<Scalars['String']['input']>;
  birthDate?: InputMaybe<Scalars['Date']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  dateFilters?: InputMaybe<Scalars['String']['input']>;
  emailValidationStatus?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  form?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  integration?: InputMaybe<Scalars['String']['input']>;
  leadStatus?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCustomersMainArgs = {
  autoCompletion?: InputMaybe<Scalars['Boolean']['input']>;
  autoCompletionType?: InputMaybe<Scalars['String']['input']>;
  birthDate?: InputMaybe<Scalars['Date']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  dateFilters?: InputMaybe<Scalars['String']['input']>;
  emailValidationStatus?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  form?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  integration?: InputMaybe<Scalars['String']['input']>;
  leadStatus?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryDealDetailArgs = {
  _id: Scalars['String']['input'];
  clientPortalCard?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryDealsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  boardIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  dateRangeFilters?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  initialStageId?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stageChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  stageCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryDealsTotalAmountsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  boardIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  dateRangeFilters?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stageChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  stageCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryDealsTotalCountArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  boardIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  dateRangeFilters?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  initialStageId?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stageChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  stageCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryDepartmentDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryDepartmentsArgs = {
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  withoutUserFilter?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryDepartmentsMainArgs = {
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  withoutUserFilter?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryEmailDeliveriesAsLogsArgs = {
  contentId: Scalars['String']['input'];
};

export type QueryEmailDeliveryDetailArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
};

export type QueryFieldsArgs = {
  contentType: Scalars['String']['input'];
  contentTypeId?: InputMaybe<Scalars['String']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  isVisibleToCreate?: InputMaybe<Scalars['Boolean']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  searchable?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryFieldsCombinedByContentTypeArgs = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  contentType: Scalars['String']['input'];
  excludedNames?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  onlyDates?: InputMaybe<Scalars['Boolean']['input']>;
  segmentId?: InputMaybe<Scalars['String']['input']>;
  usageType?: InputMaybe<Scalars['String']['input']>;
};

export type QueryFieldsDefaultColumnsConfigArgs = {
  contentType: Scalars['String']['input'];
};

export type QueryFieldsGetDetailArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
};

export type QueryFieldsGetRelationsArgs = {
  contentType: Scalars['String']['input'];
  isVisibleToCreate?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryFieldsGroupsArgs = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  contentType?: InputMaybe<Scalars['String']['input']>;
  isDefinedByErxes?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryFormDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryFormSubmissionDetailArgs = {
  contentTypeId: Scalars['String']['input'];
};

export type QueryFormSubmissionsArgs = {
  contentTypeIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<InputMaybe<SubmissionFilter>>>;
  formId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  tagId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryFormSubmissionsTotalCountArgs = {
  contentTypeIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<InputMaybe<SubmissionFilter>>>;
  formId?: InputMaybe<Scalars['String']['input']>;
  tagId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetDbSchemaLabelsArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetSystemFieldsGroupArgs = {
  contentType?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGrowthHackDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryGrowthHacksArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  hackStage?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  initialStageId?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryGrowthHacksPriorityMatrixArgs = {
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGrowthHacksTotalCountArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  hackStage?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  initialStageId?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryInsuranceCategoriesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
};

export type QueryInsuranceCategoryArgs = {
  _id: Scalars['ID']['input'];
};

export type QueryInsuranceCategoryListArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
  sortField?: InputMaybe<Scalars['String']['input']>;
};

export type QueryInsuranceItemArgs = {
  _id: Scalars['ID']['input'];
};

export type QueryInsurancePackageArgs = {
  _id: Scalars['ID']['input'];
};

export type QueryInsurancePackageListArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
  sortField?: InputMaybe<Scalars['String']['input']>;
};

export type QueryInsurancePackagesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
  sortField?: InputMaybe<Scalars['String']['input']>;
};

export type QueryInsuranceProductArgs = {
  _id: Scalars['ID']['input'];
};

export type QueryInsuranceProductListArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
  sortField?: InputMaybe<Scalars['String']['input']>;
};

export type QueryInsuranceProductsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
};

export type QueryItemsCountByAssignedUserArgs = {
  pipelineId: Scalars['String']['input'];
  stackBy?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type QueryItemsCountBySegmentsArgs = {
  boardId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type QueryLogsArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['String']['input']>;
  objectId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryNoDepartmentUsersArgs = {
  excludeId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryOnboardingStepsCompletenessArgs = {
  steps?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryPermissionsArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  allowed?: InputMaybe<Scalars['Boolean']['input']>;
  groupId?: InputMaybe<Scalars['String']['input']>;
  module?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPermissionsTotalCountArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  allowed?: InputMaybe<Scalars['Boolean']['input']>;
  groupId?: InputMaybe<Scalars['String']['input']>;
  module?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPipelineAssignedUsersArgs = {
  _id: Scalars['String']['input'];
};

export type QueryPipelineDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryPipelineLabelDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryPipelineLabelsArgs = {
  pipelineId: Scalars['String']['input'];
};

export type QueryPipelineStateCountArgs = {
  boardId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPipelineTemplateDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryPipelineTemplatesArgs = {
  type: Scalars['String']['input'];
};

export type QueryPipelinesArgs = {
  boardId?: InputMaybe<Scalars['String']['input']>;
  isAll?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPurchaseDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryPurchasecheckDiscountArgs = {
  _id: Scalars['String']['input'];
  products?: InputMaybe<Array<InputMaybe<ProductField>>>;
};

export type QueryPurchasesArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  initialStageId?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stageChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryPurchasesTotalAmountsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stageChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryPurchasesTotalCountArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  initialStageId?: InputMaybe<Scalars['String']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stageChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryRiskArgs = {
  _id: Scalars['ID']['input'];
};

export type QueryRisksArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
};

export type QueryRisksPaginatedArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
  sortField?: InputMaybe<Scalars['String']['input']>;
};

export type QueryRobotEntriesArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  isNotified?: InputMaybe<Scalars['Boolean']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
};

export type QuerySearchArgs = {
  value: Scalars['String']['input'];
};

export type QueryStageDetailArgs = {
  _id: Scalars['String']['input'];
  age?: InputMaybe<Scalars['Int']['input']>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  extraParams?: InputMaybe<Scalars['JSON']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
};

export type QueryStagesArgs = {
  age?: InputMaybe<Scalars['Int']['input']>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  extraParams?: InputMaybe<Scalars['JSON']['input']>;
  isAll?: InputMaybe<Scalars['Boolean']['input']>;
  isNotLost?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pipelineId: Scalars['String']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
};

export type QueryTaskDetailArgs = {
  _id: Scalars['String']['input'];
  clientPortalCard?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryTasksArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  boardIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsDataFilters?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  dateRangeFilters?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryTasksAsLogsArgs = {
  contentId: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryTasksTotalCountArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  boardIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsDataFilters?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  dateRangeFilters?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  stageCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryTicketDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryTicketsArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  boardIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsDataFilters?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  dateRangeFilters?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryTicketsTotalCountArgs = {
  _ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  assignedUserIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  boardIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closeDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  closeDateType?: InputMaybe<Scalars['String']['input']>;
  companyIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  conformityIsRelated?: InputMaybe<Scalars['Boolean']['input']>;
  conformityIsSaved?: InputMaybe<Scalars['Boolean']['input']>;
  conformityMainType?: InputMaybe<Scalars['String']['input']>;
  conformityMainTypeId?: InputMaybe<Scalars['String']['input']>;
  conformityRelType?: InputMaybe<Scalars['String']['input']>;
  createdEndDate?: InputMaybe<Scalars['Date']['input']>;
  createdStartDate?: InputMaybe<Scalars['Date']['input']>;
  customFieldsDataFilters?: InputMaybe<Scalars['JSON']['input']>;
  customerIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<ItemDate>;
  dateRangeFilters?: InputMaybe<Scalars['JSON']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hasStartAndCloseDate?: InputMaybe<Scalars['Boolean']['input']>;
  labelIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  noSkipArchive?: InputMaybe<Scalars['Boolean']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  pipelineId?: InputMaybe<Scalars['String']['input']>;
  pipelineIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  priority?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  search?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stageId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  startDateEndDate?: InputMaybe<Scalars['Date']['input']>;
  startDateStartDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedEndDate?: InputMaybe<Scalars['Date']['input']>;
  stateChangedStartDate?: InputMaybe<Scalars['Date']['input']>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryTransactionEmailDeliveriesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUnitDetailArgs = {
  _id: Scalars['String']['input'];
};

export type QueryUnitsArgs = {
  searchValue?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUnitsMainArgs = {
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUserDetailArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUserMovementsArgs = {
  contentType?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};

export type QueryUsersArgs = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  brandIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  excludeIds?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  requireUsername?: InputMaybe<Scalars['Boolean']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['Int']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  unitId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUsersGroupsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryUsersTotalCountArgs = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  branchIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  brandIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  departmentIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  requireUsername?: InputMaybe<Scalars['Boolean']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  segment?: InputMaybe<Scalars['String']['input']>;
  segmentData?: InputMaybe<Scalars['String']['input']>;
  unitId?: InputMaybe<Scalars['String']['input']>;
};

export type Risk = {
  __typename?: 'Risk';
  _id: Scalars['ID']['output'];
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastModifiedBy?: Maybe<User>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['Date']['output']>;
};

export type RiskConfig = {
  __typename?: 'RiskConfig';
  coverage?: Maybe<Scalars['Float']['output']>;
  coverageLimit?: Maybe<Scalars['Float']['output']>;
  riskId: Scalars['ID']['output'];
};

export type RiskConfigInput = {
  coverage?: InputMaybe<Scalars['Float']['input']>;
  coverageLimit?: InputMaybe<Scalars['Float']['input']>;
  riskId: Scalars['ID']['input'];
};

export type RiskPage = {
  __typename?: 'RiskPage';
  count?: Maybe<Scalars['Int']['output']>;
  risks?: Maybe<Array<Maybe<Risk>>>;
};

export type RobotEntry = {
  __typename?: 'RobotEntry';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['JSON']['output']>;
};

export type Rule = {
  __typename?: 'Rule';
  _id: Scalars['String']['output'];
  condition: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  text: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type SchemaField = {
  __typename?: 'SchemaField';
  label?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Stage = {
  __typename?: 'Stage';
  _id: Scalars['String']['output'];
  age?: Maybe<Scalars['Int']['output']>;
  amount?: Maybe<Scalars['JSON']['output']>;
  canEditMemberIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  canMoveMemberIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  code?: Maybe<Scalars['String']['output']>;
  compareNextStage?: Maybe<Scalars['JSON']['output']>;
  compareNextStagePurchase?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  defaultTick?: Maybe<Scalars['Boolean']['output']>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  formId?: Maybe<Scalars['String']['output']>;
  inProcessDealsTotalCount?: Maybe<Scalars['Int']['output']>;
  inProcessPurchasesTotalCount?: Maybe<Scalars['Int']['output']>;
  initialDealsTotalCount?: Maybe<Scalars['Int']['output']>;
  initialPurchasesTotalCount?: Maybe<Scalars['Int']['output']>;
  itemsTotalCount?: Maybe<Scalars['Int']['output']>;
  memberIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  members?: Maybe<Array<Maybe<User>>>;
  name: Scalars['String']['output'];
  order?: Maybe<Scalars['Int']['output']>;
  pipelineId: Scalars['String']['output'];
  probability?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  stayedDealsTotalCount?: Maybe<Scalars['Int']['output']>;
  stayedPurchasesTotalCount?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  unUsedAmount?: Maybe<Scalars['JSON']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

export type Structure = {
  __typename?: 'Structure';
  _id: Scalars['String']['output'];
  code?: Maybe<Scalars['String']['output']>;
  coordinate?: Maybe<Coordinate>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Attachment>;
  links?: Maybe<Scalars['JSON']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  supervisor?: Maybe<User>;
  supervisorId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type Styles = {
  __typename?: 'Styles';
  activeTabColor?: Maybe<Scalars['String']['output']>;
  backgroundColor?: Maybe<Scalars['String']['output']>;
  baseColor?: Maybe<Scalars['String']['output']>;
  baseFont?: Maybe<Scalars['String']['output']>;
  bodyColor?: Maybe<Scalars['String']['output']>;
  dividerColor?: Maybe<Scalars['String']['output']>;
  footerColor?: Maybe<Scalars['String']['output']>;
  headerColor?: Maybe<Scalars['String']['output']>;
  headingColor?: Maybe<Scalars['String']['output']>;
  headingFont?: Maybe<Scalars['String']['output']>;
  helpColor?: Maybe<Scalars['String']['output']>;
  linkColor?: Maybe<Scalars['String']['output']>;
  linkHoverColor?: Maybe<Scalars['String']['output']>;
  primaryBtnColor?: Maybe<Scalars['String']['output']>;
  secondaryBtnColor?: Maybe<Scalars['String']['output']>;
};

export type StylesParams = {
  activeTabColor?: InputMaybe<Scalars['String']['input']>;
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  baseColor?: InputMaybe<Scalars['String']['input']>;
  baseFont?: InputMaybe<Scalars['String']['input']>;
  bodyColor?: InputMaybe<Scalars['String']['input']>;
  dividerColor?: InputMaybe<Scalars['String']['input']>;
  footerColor?: InputMaybe<Scalars['String']['input']>;
  headerColor?: InputMaybe<Scalars['String']['input']>;
  headingColor?: InputMaybe<Scalars['String']['input']>;
  headingFont?: InputMaybe<Scalars['String']['input']>;
  helpColor?: InputMaybe<Scalars['String']['input']>;
  linkColor?: InputMaybe<Scalars['String']['input']>;
  linkHoverColor?: InputMaybe<Scalars['String']['input']>;
  primaryBtnColor?: InputMaybe<Scalars['String']['input']>;
  secondaryBtnColor?: InputMaybe<Scalars['String']['input']>;
};

export type Submission = {
  __typename?: 'Submission';
  _id: Scalars['String']['output'];
  contentTypeId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customer?: Maybe<Customer>;
  customerId?: Maybe<Scalars['String']['output']>;
  submissions?: Maybe<Array<Maybe<FormSubmission>>>;
};

export type SubmissionFilter = {
  formFieldId?: InputMaybe<Scalars['String']['input']>;
  operator?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['JSON']['input']>;
};

export type SuccessResult = {
  __typename?: 'SuccessResult';
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type Task = {
  __typename?: 'Task';
  _id: Scalars['String']['output'];
  assignedUserIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  assignedUsers?: Maybe<Array<Maybe<User>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  boardId?: Maybe<Scalars['String']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  companies?: Maybe<Array<Maybe<Company>>>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<User>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Array<Maybe<Customer>>>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  description?: Maybe<Scalars['String']['output']>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labelIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  labels?: Maybe<Array<Maybe<PipelineLabel>>>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  modifiedBy?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Float']['output']>;
  pipeline?: Maybe<Pipeline>;
  priority?: Maybe<Scalars['String']['output']>;
  reminderMinute?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  stage?: Maybe<Stage>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  stageId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  timeTrack?: Maybe<TimeTrack>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type TaskListItem = {
  __typename?: 'TaskListItem';
  _id: Scalars['String']['output'];
  assignedUsers?: Maybe<Scalars['JSON']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  branches?: Maybe<Array<Maybe<Branch>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  companies?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUserId?: Maybe<Scalars['String']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  customPropertiesData?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Scalars['JSON']['output']>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  departments?: Maybe<Array<Maybe<Department>>>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labels?: Maybe<Scalars['JSON']['output']>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  relations?: Maybe<Scalars['JSON']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  stage?: Maybe<Scalars['JSON']['output']>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type Ticket = {
  __typename?: 'Ticket';
  _id: Scalars['String']['output'];
  assignedUserIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  assignedUsers?: Maybe<Array<Maybe<User>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  boardId?: Maybe<Scalars['String']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  companies?: Maybe<Array<Maybe<Company>>>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUser?: Maybe<User>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Array<Maybe<Customer>>>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  description?: Maybe<Scalars['String']['output']>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labelIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  labels?: Maybe<Array<Maybe<PipelineLabel>>>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  modifiedBy?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Float']['output']>;
  pipeline?: Maybe<Pipeline>;
  priority?: Maybe<Scalars['String']['output']>;
  reminderMinute?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  stage?: Maybe<Stage>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  stageId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  timeTrack?: Maybe<TimeTrack>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type TicketListItem = {
  __typename?: 'TicketListItem';
  _id: Scalars['String']['output'];
  assignedUsers?: Maybe<Scalars['JSON']['output']>;
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  branches?: Maybe<Array<Maybe<Branch>>>;
  closeDate?: Maybe<Scalars['Date']['output']>;
  companies?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdUserId?: Maybe<Scalars['String']['output']>;
  customProperties?: Maybe<Scalars['JSON']['output']>;
  customPropertiesData?: Maybe<Scalars['JSON']['output']>;
  customers?: Maybe<Scalars['JSON']['output']>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  departments?: Maybe<Array<Maybe<Department>>>;
  hasNotified?: Maybe<Scalars['Boolean']['output']>;
  isComplete?: Maybe<Scalars['Boolean']['output']>;
  isWatched?: Maybe<Scalars['Boolean']['output']>;
  labels?: Maybe<Scalars['JSON']['output']>;
  modifiedAt?: Maybe<Scalars['Date']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  relations?: Maybe<Scalars['JSON']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  stage?: Maybe<Scalars['JSON']['output']>;
  stageChangedDate?: Maybe<Scalars['Date']['output']>;
  startDate?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type TimeTrack = {
  __typename?: 'TimeTrack';
  startDate?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  timeSpent?: Maybe<Scalars['Int']['output']>;
};

export enum TokenPassMethod {
  Cookie = 'cookie',
  Header = 'header'
}

export type TotalForType = {
  __typename?: 'TotalForType';
  _id?: Maybe<Scalars['String']['output']>;
  currencies?: Maybe<Array<Maybe<DealTotalCurrency>>>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Unit = {
  __typename?: 'Unit';
  _id: Scalars['String']['output'];
  code?: Maybe<Scalars['String']['output']>;
  department?: Maybe<Department>;
  departmentId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  supervisor?: Maybe<User>;
  supervisorId?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  userIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  users?: Maybe<Array<Maybe<User>>>;
};

export type UnitListQueryResponse = {
  __typename?: 'UnitListQueryResponse';
  list?: Maybe<Array<Maybe<Unit>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
  totalUsersCount?: Maybe<Scalars['Int']['output']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String']['output'];
  branchIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  branches?: Maybe<Array<Maybe<Branch>>>;
  brandIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  brands?: Maybe<Array<Maybe<Brand>>>;
  configs?: Maybe<Scalars['JSON']['output']>;
  configsConstants?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
  department?: Maybe<Department>;
  departmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  departments?: Maybe<Array<Maybe<Department>>>;
  details?: Maybe<UserDetailsType>;
  email?: Maybe<Scalars['String']['output']>;
  emailSignatures?: Maybe<Scalars['JSON']['output']>;
  employeeId?: Maybe<Scalars['String']['output']>;
  getNotificationByEmail?: Maybe<Scalars['Boolean']['output']>;
  groupIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isOwner?: Maybe<Scalars['Boolean']['output']>;
  isShowNotification?: Maybe<Scalars['Boolean']['output']>;
  isSubscribed?: Maybe<Scalars['String']['output']>;
  leaderBoardPosition?: Maybe<Scalars['Int']['output']>;
  links?: Maybe<Scalars['JSON']['output']>;
  onboardingHistory?: Maybe<OnboardingHistory>;
  permissionActions?: Maybe<Scalars['JSON']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type UserDetails = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  birthDate?: InputMaybe<Scalars['Date']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  employeeId?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  operatorPhone?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  shortName?: InputMaybe<Scalars['String']['input']>;
  workStartedDate?: InputMaybe<Scalars['Date']['input']>;
};

export type UserDetailsType = {
  __typename?: 'UserDetailsType';
  avatar?: Maybe<Scalars['String']['output']>;
  birthDate?: Maybe<Scalars['Date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  employeeId?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  operatorPhone?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['String']['output']>;
  shortName?: Maybe<Scalars['String']['output']>;
  workStartedDate?: Maybe<Scalars['Date']['output']>;
};

export type UserMovement = {
  __typename?: 'UserMovement';
  _id?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<Scalars['String']['output']>;
  contentTypeDetail?: Maybe<Scalars['JSON']['output']>;
  contentTypeId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByDetail?: Maybe<Scalars['JSON']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  userDetail?: Maybe<Scalars['JSON']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type UserNotificationSettings = {
  __typename?: 'UserNotificationSettings';
  configs?: Maybe<Array<Maybe<NotificationConfig>>>;
  receiveByEmail?: Maybe<Scalars['Boolean']['output']>;
  receiveBySms?: Maybe<Scalars['Boolean']['output']>;
};

export type UsersGroup = {
  __typename?: 'UsersGroup';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  memberIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  members?: Maybe<Array<Maybe<User>>>;
  name: Scalars['String']['output'];
};

export type VerificationRequest = {
  __typename?: 'VerificationRequest';
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  description?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  verifiedBy?: Maybe<Scalars['String']['output']>;
};

export type ClientPortalUsersListResponse = {
  __typename?: 'clientPortalUsersListResponse';
  list?: Maybe<Array<Maybe<ClientPortalUser>>>;
  totalCount?: Maybe<Scalars['Float']['output']>;
};

export type ObjectListConfigInput = {
  key?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};
