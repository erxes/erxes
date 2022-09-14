import { generateFields } from './utils';

export default {
  types: [
    {
      description: 'Cars',
      type: 'car'
    }
  ],
  fields: generateFields,
  defaultColumnsConfig: {
    car: [
      { name: 'drivers', label: 'Driver(s)', order: 1 },
      { name: 'companies', label: 'Company(s)', order: 2 },
      { name: 'plateNumber', label: 'Plate number', order: 3 },
      { name: 'vinNumber', label: 'Vin number', order: 4 },
      { name: 'vintageYear', label: 'Vintage year', order: 5 },
      { name: 'importYear', label: 'Import year', order: 6 },
      { name: 'description', label: 'Description', order: 7 }
    ]
  }
};
