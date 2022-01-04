export const leadIntegrations = `
  query integrations($perPage: Int, $page: Int, $kind: String, $status: String, $formLoadType: String) {
    integrations(perPage: $perPage, page: $page, kind: $kind, status: $status, formLoadType: $formLoadType) {
      _id
      name
      code
      kind
      brand {
        _id
        name
        code
      }
      form {
        _id
        code
      }
    }
  }
`;
