const removeAccount = `
  mutation telegramAccountRemove($_id: String!) {
    telegramAccountRemove(_id: $_id)
  }
`;

const addAccount = `
  mutation telegramAccountAdd($token: String!) {
    telegramAccountAdd(token: $token)
  }
`;

export default {
  removeAccount,
  addAccount
};
