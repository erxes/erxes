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
      { name: 'plateNumber', label: 'Plate number', order: 1 },
      { name: 'vinNumber', label: 'Vin number', order: 2 },
      { name: 'vintageYear', label: 'Vintage year', order: 3 },
      { name: 'importYear', label: 'Import year', order: 4 },
      { name: 'description', label: 'Description', order: 5 }
    ]
  }
};
