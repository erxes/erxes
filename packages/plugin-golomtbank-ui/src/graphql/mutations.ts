const addMutation = `
mutation GolomtBankConfigsAdd($name: String, $organizationName: String, $clientId: String, $ivKey: String, $sessionKey: String, $configPassword: String, $registerId: String) {
  golomtBankConfigsAdd(name: $name, organizationName: $organizationName, clientId: $clientId, ivKey: $ivKey, sessionKey: $sessionKey, configPassword: $configPassword, registerId: $registerId) {
    _id
    name
    organizationName
    clientId
    ivKey
    sessionKey
    configPassword
    registerId
  }
}
`;

const editMutation = `
mutation GolomtBankConfigsEdit($_id: String!, $consumerKey: String!, $name: String!, $secretKey: String!, $description: String) {
    golomtBankConfigsEdit(_id: $_id, consumerKey: $consumerKey, name: $name, secretKey: $secretKey, description: $description) {
        _id
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
