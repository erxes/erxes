const removeAccount = `
  mutation {name}AccountRemove($_id: String!) {
    {name}AccountRemove(_id: $_id)
  }
`;


export default {
  removeAccount
};