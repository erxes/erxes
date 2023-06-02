const removeAccount = `
  mutation discordAccountRemove($_id: String!) {
    discordAccountRemove(_id: $_id)
  }
`;

export default {
  removeAccount
};
