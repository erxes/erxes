module.exports = {
  loansResearch: {
    name: 'loansResearch',
    description: 'LoansResearch',
    actions: [
      {
        name: 'loansResearchAll',
        description: 'All',
        use: ['showLoanResearch', 'manageLoanResearch'],
      },
      {
        name: 'showLoanResearch',
        description: 'Show loansresearch',
      },
      {
        name: 'manageLoanResearch',
        description: 'Manage loansresearch',
      },
    ],
  },
};
