const linkedAccounts = `
    query integrationLinkedAccounts {
        integrationLinkedAccounts {
            _id
            accountName
            accountId
            kind
        }
    }
`;

export default { linkedAccounts };
