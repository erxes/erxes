export default {
  cars: {
    name: 'cars',
    description: 'Cars',
    actions: [
      {
        name: 'carsAll',
        description: 'All',
        use: ['showCars', 'manageCars']
      },
      {
        name: 'manageCars',
        description: 'Manage cars'
      },
      {
        name: 'showCars',
        description: 'Show cars'
      }
    ]
  }
};
