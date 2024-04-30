const removeAccount = `
  mutation golomtbankAccountRemove($_id: String!) {
    golomtbankAccountRemove(_id: $_id)
  }
`;


export default {
  removeAccount
};