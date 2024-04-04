module.exports = {
  savings: {
    name: 'savings',
    description: 'Saving',
    actions: [
      {
        name: 'savingsAll',
        description: 'All Saving',
        use: [
          'savingsContractsAdd',
          'savingsContractsEdit',
          'savingsContractsDealEdit',
          'savingsContractsClose',
          'savingsContractsRemove',
          'savingsShowContracts',
          'savingsManageContracts',
          'savingsManageSchedule',
          'savingsShowCollaterals',
          'savingsManageSavingConfigs',
          'savingsManageInsuranceTypes',
          'savingsManageInvoices',
          'savingsShowSavingInvoices',
          'savingsManageTransactions',
          'savingsShowTransactions',
          'savingsTransactionsEdit',
          'savingsTransactionsRemove',
          'savingsShowPeriodLocks',
          'savingsManagePeriodLocks'
        ]
      },
      {
        name: 'savingsContractsAll',
        description: 'Manage All Saving Contracts',
        use: [
          'savingsContractsAdd',
          'savingsContractsEdit',
          'savingsContractsDealEdit',
          'savingsContractsClose',
          'savingsContractsRemove',
          'savingsShowContracts'
        ]
      },
      {
        name: 'savingsTransactionsAll',
        description: 'Manage All Saving Transaction',
        use: [
          'savingsManageTransactions',
          'savingsShowTransactions',
          'transactionsEdit',
          'transactionsRemove'
        ]
      },
      {
        name: 'savingsPeriodLocksAll',
        description: 'Saving Manage All Period Locks',
        use: ['savingsShowPeriodLocks', 'savingsManagePeriodLocks']
      },
      //#region contract
      {
        name: 'savingsContractsAdd',
        description: 'Saving Contract Add'
      },
      {
        name: 'savingsContractsEdit',
        description: 'Saving Contract Edit'
      },
      {
        name: 'savingsContractsDealEdit',
        description: 'Saving Contract Deal Relation'
      },
      {
        name: 'savingsContractsClose',
        description: 'Close Saving Contract'
      },
      {
        name: 'savingsContractsRemove',
        description: 'Delete Saving Contract'
      },
      {
        name: 'savingsShowContracts',
        description: 'Show Saving Contracts'
      },
      {
        name: 'savingsManageContracts',
        description: 'Manage Saving Contracts'
      },
      //#endregion
      //insurance
      {
        name: 'manageSavingsConfigs',
        description: 'Manage Saving Configs'
      },
      //transaction
      {
        name: 'savingsManageTransactions',
        description: 'Manage Saving Transaction'
      },
      {
        name: 'savingsShowTransactions',
        description: 'Show Saving Transactions'
      },
      {
        name: 'savingsTransactionsEdit',
        description: 'Edit Saving Transactions'
      },
      {
        name: 'savingsTransactionsRemove',
        description: 'Remove Saving Transactions'
      },
      //period Lock
      {
        name: 'showSavingsPeriodLocks',
        description: 'Show Saving Period Locks'
      },
      {
        name: 'manageSavingsPeriodLocks',
        description: 'Manage Saving Period Locks'
      }
    ]
  }
};
