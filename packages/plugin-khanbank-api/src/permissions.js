module.exports = {
    khanbankConfigs: {
        name: 'khanbankConfigs',
        description: 'Khanbank Configs',
        actions: [
            {
                name: 'khanbankConfigsAll',
                description: 'All',
                use: [
                    'khanbankConfigsAdd',
                    'khanbankConfigsEdit',
                    'khanbankConfigsRemove',
                    'khanbankConfigsShow',
                ]
            },
            {
                name: 'khanbankConfigsAdd',
                description: 'Add new config'
            },
            {
                name: 'khanbankConfigsEdit',
                description: 'Edit config'
            },
            {
                name: 'khanbankConfigsRemove',
                description: 'Remove config'
            },
            {
                name: 'khanbankConfigsShow',
                description: 'Show configs'
            }
        ]
    },
    khanbankAccounts: {
        name: 'khanbankAccounts',
        description: 'Khanbank Accounts',
        actions: [
            {
                name: 'khanbankAccountsAll',
                description: 'All',
                use: [
                    'khanbankAccountDetail',
                    'khanbankAccounts',
                ]
            }, {
                name: 'khanbankAccountDetail',
                description: 'Show Khanbank Account detail'
            }, {
                name: 'khanbankAccounts',
                description: 'Show Khanbank accounts'
            },
        ]
    },
    khanbankTransactions: {
        name: 'khanbankTransactions',
        description: 'Khanbank Transactions',
        actions: [
            {
                name: 'khanbankTransactionsAll',
                description: 'All',
                use: [
                    'khanbankTransactionsShow',
                    'khanbankTransfer',
                ]
            },
            {
                name: 'khanbankTransactionsShow',
                description: 'Show Khanbank transactions'
            },
            {
                name: 'khanbankTransfer',
                description: 'Create Khanbank transactions'
            }
        ]
    }
};