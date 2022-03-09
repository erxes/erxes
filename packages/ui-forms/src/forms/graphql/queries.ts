const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $formId: String) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, formId: $formId)
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
  $contentTypeIds: [String]
  $filters: [SubmissionFilter]
) {
  formSubmissions(
    tagId: $tagId
    formId: $formId
    contentTypeIds: $contentTypeIds
    filters: $filters
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
  query formSubmissionsTotalCount($integrationId: String!) {
    formSubmissionsTotalCount(integrationId: $integrationId)
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
