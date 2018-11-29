const delinkAccount = `
    mutation accountsRemove($_id: String!) {
        accountsRemove(_id: $_id)
    }
`;

const linkTwitterAccount = `
    mutation accountsAddTwitter($queryParams: TwitterIntegrationAuthParams) {
        accountsAddTwitter(queryParams: $queryParams) {
            _id
        }
    }
`;

export default {
  delinkAccount,
  linkTwitterAccount
};
