const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config)
  }
`;

const fields = `
  query fields($contentType: String!, $contentTypeId: String) {
    fields(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
      type
      validation
      text
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
      groupName
      associatedFieldId
      associatedField {
        _id
        text
        contentType
      }
      pageNumber
      productCategoryId
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

export default {
  fieldsDefaultColumnsConfig,
  fieldsCombinedByContentType,
  fields,
  formDetail,
  forms,
  formSubmissions,
  formSubmissionTotalCount
};
