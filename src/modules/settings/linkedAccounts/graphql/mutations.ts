const delinkAccount = `
    mutation removeAccount($_id: String!) {
        removeAccount(_id: $_id)
    }
`;

export default {
  delinkAccount
};
