const delinkAccount = `
    mutation integrationsDelinkAccount($_id: String!) {
        integrationsDelinkAccount(_id: $_id)
    }
`;

export default {
  delinkAccount
};
