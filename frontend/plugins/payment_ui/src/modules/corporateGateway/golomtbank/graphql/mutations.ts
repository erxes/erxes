const addMutation = `
mutation GolomtBankConfigsAdd(
  $name: String
  $organizationName: String
  $clientId: String
  $ivKey: String
  $sessionKey: String
  $configPassword: String
  $registerId: String
  $accountId: String
  $golomtCode: String
  $apiUrl: String
) {
  golomtBankConfigsAdd(
    name: $name
    organizationName: $organizationName
    clientId: $clientId
    ivKey: $ivKey
    sessionKey: $sessionKey
    configPassword: $configPassword
    registerId: $registerId
    accountId: $accountId
    golomtCode: $golomtCode
    apiUrl: $apiUrl
  ) {
    _id
    name
    organizationName
    clientId
    ivKey
    sessionKey
    configPassword
    registerId
    accountId
    golomtCode
    apiUrl
  }
}
`;

const editMutation = `
mutation GolomtBankConfigsEdit(
  $_id: String!
  $name: String
  $organizationName: String
  $clientId: String
  $ivKey: String
  $sessionKey: String
  $configPassword: String
  $registerId: String
  $accountId: String
  $golomtCode: String
  $apiUrl: String
) {
  golomtBankConfigsEdit(
    _id: $_id
    name: $name
    organizationName: $organizationName
    clientId: $clientId
    ivKey: $ivKey
    sessionKey: $sessionKey
    configPassword: $configPassword
    registerId: $registerId
    accountId: $accountId
    golomtCode: $golomtCode
    apiUrl: $apiUrl
  ) {
    _id
    name
    organizationName
    clientId
    ivKey
    sessionKey
    configPassword
    registerId
    accountId
    golomtCode
    apiUrl
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
  removeMutation,
};
