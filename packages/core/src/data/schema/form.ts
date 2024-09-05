export const types = `
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
    name: String!
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
    fields: [Field]

    visibility: String
    leadData: JSON
    languageCode: String
    departmentIds: [String]
    tagIds: [String]
    tags: [Tag]
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
    byBrand: JSON
    byStatus: JSON
  }
`;

const commonFields = `
  name: String!
  title: String,
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

export const queries = `
  formDetail(_id: String!): Form
  forms(page: Int,perPage: Int,type: String, brandId: String, tagId: String, status: String): [Form]
  formsTotalCount(type: String, brandId: String, tagId: String, status: String): FormsTotalCount
  formSubmissions(${formSubmissionQueryParams}, page: Int, perPage: Int): [Submission]
  formSubmissionsTotalCount(${formSubmissionQueryParams}): Int
  formSubmissionDetail(contentTypeId: String!): Submission

  formsGetContentTypes: [FormType]
`;

export const mutations = `
  formsAdd(${commonFields}): Form
  formsEdit(_id: String!, ${commonFields} ): Form
  formSubmissionsSave(${commonFormSubmissionFields}): Boolean

  formSubmissionsRemove(customerId: String!, contentTypeId: String!): JSON
  formSubmissionsEdit(contentTypeId: String!, customerId: String!, submissions: [FormSubmissionInput]): Submission
`;
