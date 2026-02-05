export const types = `
  extend type Company @key(fields: "_id") {
      _id: String! @external
  }

  input SubmissionFilter {
    operator: String
    value: JSON
    formFieldId: String
  }
  
  type Callout {
    title: String,
    body: String,
    buttonText: String,
    featuredImage: String,
    skip: Boolean
  }

  type Form @key(fields: "_id") {
    _id: String!
    name: String
    title: String
    code: String
    type: String
    description: String
    buttonText: String
    createdUserId: String
    createdUser: User
    createdDate: Date
    numberOfPages: Int
    status: String

    googleMapApiKey: String
    fields: [FrontlineField]

    visibility: String
    leadData: JSON
    languageCode: String
    departmentIds: [String]
    tagIds: [String]
    tags: [Tag]
    channelId: String
    integrationId: String
  }

  type FormSubmission {
    _id: String!
    customerId: String
    formId: String
    formFieldId: String
    text: String
    formFieldText: String
    value: JSON
    submittedAt: Date
  }

  type Submission @key(fields: "_id") {
    _id: String!
    contentTypeId: String
    customerId: String
    customer: Customer
    createdAt: Date
    customFieldsData:JSON
    submissions: [FormSubmission]
  }

  input FormSubmissionInput {
    _id: String!
    value: JSON
  }

  type FormType {
    title: String
    description: String
    contentType: String
    icon: String
  }

  type FormsTotalCount {
    total: Int
    byTag: JSON
    byChannel: JSON
    byStatus: JSON
  }


  type FormConnectResponse {
      form: Form
  }

  type SaveFormResponse {
    status: String!
    errors: [Error]
    conversationId: String
    customerId: String
    userId: String
  }

  type Error {
    fieldId: String
    code: String
    text: String
  }

  input FieldValueInput {
    _id: String!
    type: String
    validation: String
    text: String
    value: JSON
    associatedFieldId: String
    stageId: String
    groupId: String
    column: Int
    productId: String
  }


  type FormListResponse {
    list: [Form],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

const commonFields = `
  name: String!
  title: String,
  channelId: String,
  description: String,
  buttonText: String,
  type: String!,
  numberOfPages: Int,
  googleMapApiKey: String

  visibility: String
  leadData: JSON
  languageCode: String
  departmentIds: [String]
  tagIds: [String]
  integrationId: String
`;

const commonFormSubmissionFields = `
  formId: String,
  contentTypeId: String,
  contentType: String,
  formSubmissions: JSON
`;

const formSubmissionQueryParams = `
  tagId: String, 
  formId: String, 
  customerId: String,

  contentTypeIds: [String],
  filters: [SubmissionFilter]
`;
export const cursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
  cursorMode: CURSOR_MODE
  orderBy: JSON
`;

export const queries = `
  formDetail(_id: String!): Form
  forms(type: String, channelId: String, tagId: String, status: String, searchValue: String,${cursorParams}, skip: Int): FormListResponse
  formsMain(type: String, channelId: String, tagId: String, status: String, searchValue: String,${cursorParams}, skip: Int): FormListResponse
  formsTotalCount(type: String, channelId: String, tagId: String, status: String, searchValue: String,${cursorParams} ): FormsTotalCount
  formSubmissions(${formSubmissionQueryParams}, ${cursorParams}): [Submission]
  formSubmissionsTotalCount(${formSubmissionQueryParams},${cursorParams}): Int
  formSubmissionDetail(contentTypeId: String!): Submission

  formsGetContentTypes: [FormType]
`;

export const mutations = `
  formsAdd(${commonFields}): Form
  formsEdit(_id: String!, ${commonFields} ): Form
  formsRemove(_id: String!): JSON
  formsToggleStatus(_id: String!): Form
  formsDuplicate(_id: String!): Form
  formSubmissionsSave(${commonFormSubmissionFields}): Boolean

  formSubmissionsRemove(customerId: String!, contentTypeId: String!): JSON
  formSubmissionsEdit(contentTypeId: String!, customerId: String!, submissions: [FormSubmissionInput]): Submission


  widgetsLeadConnect(
    channelId: String!,
    formCode: String!,
    cachedCustomerId: String
  ): FormConnectResponse

  widgetsSaveLead(
      formId: String!
      submissions: [FieldValueInput]
      browserInfo: JSON!
      cachedCustomerId: String
    ): SaveFormResponse


`;
