const integrations = `
  query integrations($perPage: Int, $page: Int, $kind: String, $tag: String) {
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
      formData
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
      formData
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
      }
    }
  }
`;

const brands = `
  query brands($page: Int, $perPage: Int) {
    brands(page: $page, perPage: $perPage) {
      _id
      code
      name
      createdAt
      description
    }
  }
`;

const integrationsCount = `
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

const users = `
  query users {
    users {
      _id
      details {
        avatar
        fullName
      }
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

export default {
  integrations,
  integrationDetail,
  integrationsCount,
  fields,
  brands,
  users,
  tags,
  fieldsCombinedByContentType,
  fieldsDefaultColumnsConfig
};
