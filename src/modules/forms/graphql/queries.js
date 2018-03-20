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

export default {
  integrations,
  integrationsCount,
  fields,
  brands,
  forms,
  fieldsCombinedByContentType,
  fieldsDefaultColumnsConfig
};
