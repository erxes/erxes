const addMutation = `
mutation KhanbankConfigsAdd($consumerKey: String!, $name: String!, $secretKey: String!,  $description: String) {
    khanbankConfigsAdd(consumerKey: $consumerKey, name: $name, secretKey: $secretKey, description: $description) {
      _id
    }
  }
`;

const editMutation = `
mutation KhanbankConfigsEdit($_id: String!, $consumerKey: String!, $name: String!, $secretKey: String!, $description: String) {
    khanbankConfigsEdit(_id: $_id, consumerKey: $consumerKey, name: $name, secretKey: $secretKey, description: $description) {
        _id
    }
}
`;

const removeMutation = `
mutation KhanbankConfigsRemove($_id: String) {
    khanbankConfigsRemove(_id: $_id)
  }
`;

export default {
  addMutation,
  editMutation,
  removeMutation
};
