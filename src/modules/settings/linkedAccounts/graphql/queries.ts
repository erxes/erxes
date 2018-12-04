const accounts = `
  query accounts($kind: String) {
    accounts(kind: $kind) {
        _id
        name
        id
        kind
    }
  }
`;

export default { accounts };
