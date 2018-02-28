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
      }
    }
  }
`;

const integrationsCount = `
  query totalIntegrationsCount($kind: String) {
    integrationsTotalCount(kind: $kind)
  }
`;

export default {
  integrations,
  integrationsCount
};
