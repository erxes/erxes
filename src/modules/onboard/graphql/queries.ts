const channels = `
  query channels($memberIds: [String]) {
    channels(memberIds: $memberIds) {
      _id
      name
      description
      memberIds
    }
  }
`;

const integrations = `
  query integrations($kind: String) {
    integrations(kind: $kind) {
      _id
      brandId
      languageCode
      name
      kind
      brand {
        _id
        name
        code
      }
    }
  }
`;

export default {
  channels,
  integrations
};
