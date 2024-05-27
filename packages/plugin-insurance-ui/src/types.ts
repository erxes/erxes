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

export type ColumnConfigItem = {
  __typename?: 'ColumnConfigItem';
  label?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
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

export type Coordinate = {
  __typename?: 'Coordinate';
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
};

export type CoordinateInput = {
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
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

export type InsuranceProduct = {
  __typename?: 'InsuranceProduct';
  _id: Scalars['ID']['output'];
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastModifiedBy?: Maybe<User>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  riskIds?: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  risks?: Maybe<Array<Maybe<Risk>>>;
  updatedAt?: Maybe<Scalars['Date']['output']>;
};

export type InsuranceProductPage = {
  __typename?: 'InsuranceProductPage';
  count?: Maybe<Scalars['Int']['output']>;
  products?: Maybe<Array<Maybe<InsuranceProduct>>>;
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

export type Mutation = {
  __typename?: 'Mutation';
  appsAdd?: Maybe<App>;
  appsEdit?: Maybe<App>;
  appsRemove?: Maybe<Scalars['JSON']['output']>;
  branchesAdd?: Maybe<Branch>;
  branchesEdit?: Maybe<Branch>;
  branchesRemove?: Maybe<Scalars['JSON']['output']>;
  brandsAdd?: Maybe<Brand>;
  brandsEdit?: Maybe<Brand>;
  brandsRemove?: Maybe<Scalars['JSON']['output']>;
  configsActivateInstallation?: Maybe<Scalars['JSON']['output']>;
  configsManagePluginInstall?: Maybe<Scalars['JSON']['output']>;
  configsUpdate?: Maybe<Scalars['JSON']['output']>;
  conformityAdd?: Maybe<Conformity>;
  conformityEdit?: Maybe<SuccessResult>;
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
  insuranceProductsAdd?: Maybe<InsuranceProduct>;
  insuranceProductsEdit?: Maybe<InsuranceProduct>;
  insuranceProductsRemove?: Maybe<Scalars['String']['output']>;
  login?: Maybe<Scalars['String']['output']>;
  logout?: Maybe<Scalars['String']['output']>;
  onboardingCheckStatus?: Maybe<Scalars['String']['output']>;
  onboardingCompleteShowStep?: Maybe<Scalars['JSON']['output']>;
  onboardingForceComplete?: Maybe<Scalars['JSON']['output']>;
  permissionsAdd?: Maybe<Array<Maybe<Permission>>>;
  permissionsFix?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  permissionsRemove?: Maybe<Scalars['JSON']['output']>;
  resetPassword?: Maybe<Scalars['JSON']['output']>;
  risksAdd?: Maybe<Risk>;
  risksEdit?: Maybe<Risk>;
  risksRemove?: Maybe<Scalars['String']['output']>;
  robotEntriesMarkAsNotified?: Maybe<Array<Maybe<RobotEntry>>>;
  structuresAdd?: Maybe<Structure>;
  structuresEdit?: Maybe<Structure>;
  structuresRemove?: Maybe<Scalars['JSON']['output']>;
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

export type MutationInsuranceProductsAddArgs = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  riskIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type MutationInsuranceProductsEditArgs = {
  _id: Scalars['ID']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  riskIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type MutationInsuranceProductsRemoveArgs = {
  _id: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
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

export type Query = {
  __typename?: 'Query';
  allBrands?: Maybe<Array<Maybe<Brand>>>;
  allUsers?: Maybe<Array<Maybe<User>>>;
  appDetail?: Maybe<App>;
  apps?: Maybe<Array<Maybe<App>>>;
  appsTotalCount?: Maybe<Scalars['Int']['output']>;
  branchDetail?: Maybe<Branch>;
  branches?: Maybe<Array<Maybe<Branch>>>;
  branchesMain?: Maybe<BranchListQueryResponse>;
  brandDetail?: Maybe<Brand>;
  brands?: Maybe<Array<Maybe<Brand>>>;
  brandsGetLast?: Maybe<Brand>;
  brandsTotalCount?: Maybe<Scalars['Int']['output']>;
  configs?: Maybe<Array<Maybe<Config>>>;
  configsCheckActivateInstallation?: Maybe<Scalars['JSON']['output']>;
  configsCheckPremiumService?: Maybe<Scalars['Boolean']['output']>;
  configsConstants?: Maybe<Scalars['JSON']['output']>;
  configsGetEmailTemplate?: Maybe<Scalars['String']['output']>;
  configsGetEnv?: Maybe<Env>;
  configsGetInstallationStatus?: Maybe<Scalars['JSON']['output']>;
  configsGetValue?: Maybe<Scalars['JSON']['output']>;
  configsGetVersion?: Maybe<Scalars['JSON']['output']>;
  currentUser?: Maybe<User>;
  departmentDetail?: Maybe<Department>;
  departments?: Maybe<Array<Maybe<Department>>>;
  departmentsMain?: Maybe<DepartmentListQueryResponse>;
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
  getFieldsInputTypes?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  getSystemFieldsGroup?: Maybe<FieldsGroup>;
  insuranceProduct?: Maybe<InsuranceProduct>;
  insuranceProducts?: Maybe<Array<Maybe<InsuranceProduct>>>;
  insuranceProductsPaginated?: Maybe<InsuranceProductPage>;
  noDepartmentUsers?: Maybe<Array<Maybe<User>>>;
  onboardingGetAvailableFeatures?: Maybe<
    Array<Maybe<OnboardingGetAvailableFeaturesResponse>>
  >;
  onboardingStepsCompleteness?: Maybe<Scalars['JSON']['output']>;
  permissionActions?: Maybe<Array<Maybe<PermissionAction>>>;
  permissionModules?: Maybe<Array<Maybe<PermissionModule>>>;
  permissions?: Maybe<Array<Maybe<Permission>>>;
  permissionsTotalCount?: Maybe<Scalars['Int']['output']>;
  risk?: Maybe<Risk>;
  risks?: Maybe<Array<Maybe<Risk>>>;
  risksPaginated?: Maybe<RiskPage>;
  robotEntries?: Maybe<Array<Maybe<RobotEntry>>>;
  search?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  structureDetail?: Maybe<Structure>;
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

export type QueryAllUsersArgs = {
  assignedToMe?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryAppDetailArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
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

export type QueryGetSystemFieldsGroupArgs = {
  contentType?: InputMaybe<Scalars['String']['input']>;
};

export type QueryInsuranceProductArgs = {
  _id: Scalars['ID']['input'];
};

export type QueryInsuranceProductsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
};

export type QueryInsuranceProductsPaginatedArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  searchValue?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
  sortField?: InputMaybe<Scalars['String']['input']>;
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

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

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

export type Submission = {
  __typename?: 'Submission';
  _id: Scalars['String']['output'];
  contentTypeId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customFieldsData?: Maybe<Scalars['JSON']['output']>;
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

export type UsersGroup = {
  __typename?: 'UsersGroup';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  memberIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  members?: Maybe<Array<Maybe<User>>>;
  name: Scalars['String']['output'];
};

export type ObjectListConfigInput = {
  key?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};
