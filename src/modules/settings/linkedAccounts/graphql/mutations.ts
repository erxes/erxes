const delinkAccount = `
    mutation accountsRemove($_id: String!) {
        accountsRemove(_id: $_id)
    }
`;

export default {
  delinkAccount
};
