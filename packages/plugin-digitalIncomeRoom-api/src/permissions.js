module.exports = {
  digitalIncomeRoom: {
    name: 'digitalIncomeRoom',
    description: 'digitalIncomeRoom',
    actions: [
      {
        name: 'digitalIncomeRoomAll',
        description: 'All',
        use: ['showdigitalIncomeRoom', 'managedigitalIncomeRoom']
      },
      {
        name: 'showdigitalIncomeRoom',
        description: 'Show digitalIncomeRoom'
      },
      {
        name: 'managedigitalIncomeRoom',
        description: 'Manage digitalIncomeRoom'
      }
    ]
  }
};
