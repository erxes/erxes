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
query Forms($page: Int, $perPage: Int, $type: String, $brandId: String, $tagId: String, $status: String, $searchValue: String) {
  forms(page: $page, perPage: $perPage, type: $type, brandId: $brandId, tagId: $tagId, status: $status, searchValue: $searchValue) {
    _id
    createdDate
    createdUserId
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
    type
    tagIds
    tags {
      _id
      name
    }
    brandId
    brand {
      _id
      name
      code
    }
      leadData
  }
}
`;

const formsTotalCount = `
  query FormsTotalCount($type: String, $brandId: String, $tagId: String, $status: String, $searchValue: String) {
  formsTotalCount(type: $type, brandId: $brandId, tagId: $tagId, status: $status, searchValue: $searchValue) {
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

const formDetail = `
query FormDetail($id: String!) {
  formDetail(_id: $id) {
    _id
    name
    title
    code
    type
    description
    buttonText
    numberOfPages
    status
    googleMapApiKey
    integrationId
    fields {
      _id
      associatedFieldId
      associatedField {
        _id
        contentType
      }
      column
      content
      contentType
      contentTypeId
      description
      field
      isRequired
      order
      pageNumber
      productCategoryId
      regexValidation
      text
      options
      type
      validation
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
      }
    }
    visibility
    leadData
    languageCode
    departmentIds
    brandId
    brand {
      _id
      name
    }
  }
}

`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON, $onlyDates: Boolean) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config, onlyDates: $onlyDates)
  }
`;

const fields = `
  query fields($contentType: String!, $contentTypeId: String, $isVisibleToCreate: Boolean, $pipelineId: String) {
    fields(contentType: $contentType, contentTypeId: $contentTypeId, isVisibleToCreate: $isVisibleToCreate, pipelineId: $pipelineId) {
      _id
      type
      validation
      regexValidation
      text
      field
      content
      description
      options
      objectListConfigs {
        key
        label
        type
      }
      isRequired
      order
      column
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
      }
      
      associatedFieldId
      associatedField {
        _id
        text
        contentType
      }
      pageNumber
      productCategoryId
      isDefinedByErxes
      optionsValues
      subFieldIds
    }
  }
`;
const fieldsGroups = `
query fieldsGroups($contentType: String!, $isDefinedByErxes: Boolean, $config: JSON) {
  fieldsGroups(
    contentType: $contentType
    isDefinedByErxes: $isDefinedByErxes
    config: $config
  ) {
    name
    _id
    description
    code
    order
    isVisible
    isVisibleInDetail
    contentType
    isDefinedByErxes
    isMultiple
    alwaysOpen
    parentId
    config

    fields {
      type
      text
      canHide
      validation
      regexValidation
      options
      isVisibleToCreate
      locationOptions {
        lat
        lng
        description
      }
      objectListConfigs {
        key
        label
        type
      }
      groupId
      searchable
      showInCard
      isRequired
      _id
      description
      code
      order
      isVisible
      isVisibleInDetail
      contentType
      isDefinedByErxes
    }
  }
}
`;

const fieldsDefaultColumnsConfig = `
  query fieldsDefaultColumnsConfig($contentType: String!) {
    fieldsDefaultColumnsConfig(contentType: $contentType) {
      name
      label
      order
    }
  }
`;

const formSubmissions = `
query formSubmissions(
  $tagId: String
  $formId: String
  $filters: [SubmissionFilter]
  $page: Int,
  $perPage: Int
) {
  formSubmissions(
    tagId: $tagId
    formId: $formId
    filters: $filters
    page: $page
    perPage: $perPage
  ) {
    contentTypeId
    customerId
    createdAt
    customer {
      primaryEmail
      primaryPhone
      lastName
      firstName
    }
    createdAt
    submissions {
      formFieldId
      value
      submittedAt
    }
  }
}
`;

const formSubmissionTotalCount = `
  query formSubmissionsTotalCount($formId: String) {
    formSubmissionsTotalCount(formId: $formId)
  }
`;

export default {
  fieldsDefaultColumnsConfig,
  fieldsCombinedByContentType,
  fields,
  formDetail,
  forms,
  formSubmissions,
  formSubmissionTotalCount,
  fieldsGroups,
  relations,
  formsGetContentTypes,
  emailTemplates,
  templateTotalCount,
  integrationDetail,
  formsTotalCount,
};
