const integrations = `
  query integrations($perPage: Int, $page: Int, $kind: String) {
    integrations(perPage: $perPage, page: $page, kind: $kind) {
      _id
      brandId
      name
      kind
      brand {
        _id
        name
        code
      }
      formData
      formId
      form {
        _id
        title
        code
        description
        createdDate
        viewCount
        contactsGathered
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
      form {
        _id
        title
        code
        description
        createdDate
        buttonText
        themeColor
        featuredImage
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

const forms = `
  query forms($page: Int, $perPage: Int) {
    forms(page: $page, perPage: $perPage) {
      _id
      title
      code
    }
  }
`;

const integrationsCount = `
  query totalIntegrationsCount($kind: String) {
    integrationsTotalCount(kind: $kind)
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

export default {
  integrations,
  integrationDetail,
  integrationsCount,
  fields,
  brands,
  forms
};
