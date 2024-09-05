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
query Forms($page: Int, $perPage: Int, $type: String, $brandId: String, $tagId: String, $status: String) {
  forms(page: $page, perPage: $perPage, type: $type, brandId: $brandId, tagId: $tagId, status: $status) {
    _id
    createdDate
    createdUser {
       _id
      details {
        avatar
        fullName
        position
      }
      email
    }
    code
    name
    title
    status
    tagIds
    tags {
      _id
      name
    }
  }
}
`;

const formsTotalCount = `
  query FormsTotalCount($type: String, $brandId: String, $tagId: String, $status: String) {
  formsTotalCount(type: $type, brandId: $brandId, tagId: $tagId, status: $status) {
    byBrand
    byStatus
    byTag
    total
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
  integrationDetail,
  formsTotalCount,
};
