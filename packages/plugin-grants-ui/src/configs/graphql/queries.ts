const configs = `
query GrantConfigs {
  grantConfigs {
    _id
    name
    scope
    action
    params
    config
    createdAt
    modifiedAt
  }
  grantConfigsTotalCount
}
`;

export default { configs };
