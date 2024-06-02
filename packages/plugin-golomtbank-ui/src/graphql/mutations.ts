// Settings

const addMutation = `
mutation GolomtBankConfigsAdd($sec: String!, $userName: String!, $secretKey: String!,  $description: String) {
    golomtBankConfigsAdd(consumerKey: $consumerKey, name: $name, secretKey: $secretKey, description: $description) {
      _id
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