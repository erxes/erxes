const addMutation = `
mutation GolomtBankConfigsAdd($name: String, $organizationName: String, $clientId: String, $ivKey: String, $sessionKey: String, $configPassword: String, $registerId: String, $accountId: String) {
  golomtBankConfigsAdd(name: $name, organizationName: $organizationName, clientId: $clientId, ivKey: $ivKey, sessionKey: $sessionKey, configPassword: $configPassword, registerId: $registerId, accountId: $accountId) {
    _id
    name
    organizationName
    clientId
    ivKey
    sessionKey
    configPassword
    registerId
    accountId
  }
}
`;

const editMutation = `
mutation GolomtBankConfigsEdit($_id: String!, $name: String, $organizationName: String, $clientId: String, $ivKey: String, $sessionKey: String, $configPassword: String, $registerId: String, $accountId: String) {
  golomtBankConfigsEdit(_id: $_id, name: $name, organizationName: $organizationName, clientId: $clientId, ivKey: $ivKey, sessionKey: $sessionKey, configPassword: $configPassword, registerId: $registerId, accountId: $accountId) {
    _id
    name
    organizationName
    clientId
    ivKey
    sessionKey
    configPassword
    registerId
    accountId
  }
}
`;

const removeMutation = `
mutation GolomtBankConfigsRemove($_id: String) {
    golomtBankConfigsRemove(_id: $_id)
  }
`;

export default {
  addMutation,
  editMutation,
  removeMutation
};
