
export default [
  { name: 'showCars', description: 'Show cars' },
  { name: 'manageCars', description: 'Manage cars' },
  {
    name: 'all', description: 'All', use: [
      'showCars',
      'manageCars',
    ]
  },
];