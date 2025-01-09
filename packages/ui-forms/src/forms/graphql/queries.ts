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

const formFields = `
    _id
    title
    code
    description
    buttonText
    numberOfPages
    createdDate
    createdUserId
`;

const formDetail = `
  query formDetail($_id: String!) {
    formDetail(_id: $_id) {
      ${formFields}
      type
      createdUser {
        _id
        details {
          avatar
          fullName
          position
        }
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

const forms = `
  query forms {
    forms {
      _id
      title
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
};
