const integrations = `
  query formIntegrations($perPage: Int, $page: Int, $kind: String, $tag: String) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag) {
      _id
      brandId
      name
      kind
      brand {
        _id
        name
        code
      }
      languageCode
      leadData
      leadId
      tags {
        _id
        name
        colorCode
      }
      tagIds
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
      _id
      name
      brand {
        _id
        name
        code
      }
      languageCode
      brandId
      code
      formId
      leadData
      tagIds
      tags {
        _id
        name
        colorCode
      }
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
      description
      options
      isRequired
      order
    }
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!) {
    fieldsCombinedByContentType(contentType: $contentType)
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
  fields,
  formDetail,
  tags,
  forms,
  fieldsCombinedByContentType,
  fieldsDefaultColumnsConfig
};
