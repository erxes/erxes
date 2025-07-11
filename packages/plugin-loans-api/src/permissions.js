module.exports = {
  loans: {
    name: 'loans',
    description: 'Loans',
    actions: [
      {
        name: 'loansAll',
        description: 'All Loan',
        use: [
          'contractsAdd',
          'contractsEdit',
          'contractsDealEdit',
          'contractsClose',
          'contractsRemove',
          'showContracts',
          'manageContracts',
          'manageSchedule',
          'showCollaterals',
          'manageLoanConfigs',
          'manageInsuranceTypes',
          'manageInvoices',
          'showLoanInvoices',
          'manageTransactions',
          'showTransactions',
          'showNonBalanceTransactions',
          'transactionsEdit',
          'transactionsRemove',
          'nonBalanceTransactionsRemove',
          'showPeriodLocks',
          'managePeriodLocks',
          'managePurpose'
        ]
      },
      {
        name: 'loansContractsAll',
        description: 'Manage All Loan Contracts',
        use: [
          'contractsAdd',
          'contractsEdit',
          'contractsDealEdit',
          'contractsClose',
          'contractsRemove',
          'showContracts',
          'manageSchedule',
          'showCollaterals'
        ]
      },
      {
        name: 'loansPurposesAll',
        description: 'Manage All Loan Purpose',
        use: ['managePurpose', 'purposeAdd', 'purposeEdit', 'purposesRemove']
      },
      {
        name: 'loansTransactionsAll',
        description: 'Manage All Loan Transaction',
        use: [
          'manageTransactions',
          'showTransactions',
          'transactionsEdit',
          'transactionsRemove'
        ]
      },
      {
        name: 'loansPeriodLocksAll',
        description: 'Manage All Period Locks',
        use: ['showPeriodLocks', 'managePeriodLocks']
      },
      //#region contract
      {
        name: 'contractsAdd',
        description: 'Contract Add'
      },
      {
        name: 'contractsEdit',
        description: 'Contract Edit'
      },
      {
        name: 'contractsDealEdit',
        description: 'Contract Deal Relation'
      },
      {
        name: 'contractsClose',
        description: 'Close Contract'
      },
      {
        name: 'contractsRemove',
        description: 'Delete Contract'
      },
      {
        name: 'showContracts',
        description: 'Show Contracts'
      },
      {
        name: 'manageContracts',
        description: 'Manage Contracts'
      },
      {
        name: 'manageSchedule',
        description: 'Manage Schedule'
      },
      {
        name: 'managePurpose',
        description: 'Manage Purpose'
      },
      {
        name: 'showCollaterals',
        description: 'Show Collaterals'
      },
      //#endregion
      //insurance
      {
        name: 'manageLoanConfigs',
        description: 'Manage Loan Configs'
      },
      {
        name: 'manageInsuranceTypes',
        description: 'Manage Insurance Config'
      },
      {
        name: 'manageInvoices',
        description: 'Manage Invoices'
      },
      {
        name: 'showLoanInvoices',
        description: 'Show Invoices'
      },
      //transaction
      {
        name: 'manageTransactions',
        description: 'Manage Transaction'
      },
      {
        name: 'showTransactions',
        description: 'Show Transactions'
      },
      {
        name: 'transactionsEdit',
        description: 'Edit Transactions'
      },
      {
        name: 'transactionsRemove',
        description: 'Remove Transactions'
      },
      //nonBalanceTransaction
      {
        name: 'showNonBalanceTransactions',
        description: 'Show Non Balance Transactions'
      },
      {
        name: 'nonBalanceTransactionsRemove',
        description: 'Remove Non Balance Transactions'
      },
      //period Lock
      {
        name: 'showPeriodLocks',
        description: 'Show Period Locks'
      },
      {
        name: 'managePeriodLocks',
        description: 'Manage Period Locks'
      }
    ]
  }
};
