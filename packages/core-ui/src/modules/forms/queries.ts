
export const commonFields = `
  brandId
  name
  kind
  code
  brand {
    _id
    name
    code
  }
  channels {
    _id
    name
  }
  languageCode
  leadData
  formId


      tags {
        _id
        name
        colorCode
      }
  
  tagIds
  form {
    _id
    title
    code
    description
    type
    buttonText
    numberOfPages
    createdDate
    createdUserId
    createdUser {
      _id
      details {
        avatar
        fullName
        position
      }
    }
  }
  isActive

  visibility
  departmentIds
`;

const forms = `
  query forms {
    forms {
      _id
      title
    }
  }
`;

const relations = `
  query FieldsGetRelations($contentType: String!, $isVisibleToCreate: Boolean) {
    fieldsGetRelations(contentType: $contentType, isVisibleToCreate: $isVisibleToCreate) {
      _id
      contentType
      name
      type
      text
      isVisibleToCreate
      relationType
    }
  }
`;

const formsGetContentTypes = `
  query FormsGetContentTypes {
    formsGetContentTypes {
      title
      description
      contentType
      icon
    }
  }
`;

const emailTemplates = `
  query emailTemplates($page: Int, $perPage: Int) {
    emailTemplates(page: $page, perPage: $perPage) {
      _id
      name
      content
    }
  }
`;

const templateTotalCount = `
  query emailTemplatesTotalCount {
    emailTemplatesTotalCount
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      ${commonFields}
    }
  }
`;

export default {
  forms,
  relations,
  formsGetContentTypes,
  emailTemplates,
  templateTotalCount,
  integrationDetail
};
