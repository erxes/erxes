const integrationFields = `
  _id
  name
  brandId
  languageCode
  leadData
  tagIds

  brand {
    _id
    name
    code
  }
  tags {
    _id
    name
    colorCode
  }
  channels {
    _id
    name
  }
`;

const integrations = `
  query formIntegrations($perPage: Int, $page: Int, $kind: String, $tag: String) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag) {
      ${integrationFields}
      kind
      leadId

      lead {
        _id
        formId
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
        themeColor
        contactsGathered
        viewCount
        callout {
          title
          body
          buttonText
          featuredImage
          skip
        }
        rules {
          _id
          kind
          text
          condition
          value
        }
        form {
          _id
          title
          code
          description
          type
          buttonText
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
      }
    }
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      ${integrationFields}
      code
      formId

      form {
        _id
        title
        code
        description
        createdDate
        createdUserId
        buttonText
        themeColor
        contactsGathered
        viewCount
        callout {
          title
          body
          buttonText
          featuredImage
          skip
        }
        rules {
          _id
          kind
          text
          condition
          value
        }
      }
    }
  }
`;

const formDetail = `
  query formDetail($_id: String!) {
    formDetail(_id: $_id) {
      _id
      title
      code
      type
      description
      buttonText
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
  }
`;

const integrationsTotalCount = `
  query integrationsTotalCount {
    integrationsTotalCount {
      byKind
      byTag
    }
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
    }
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $pipelineId: String) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, pipelineId: $pipelineId)
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

const tags = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
      type
      colorCode
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

export default {
  integrations,
  integrationDetail,
  integrationsTotalCount,
  formDetail,
  tags,
  forms,
  fieldsCombinedByContentType,
  fieldsDefaultColumnsConfig,
  fields
};
