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
      { name: 'parentCarCategoryId', label: 'Category', order: 1 },
      { name: 'carCategoryId', label: 'Sub category', order: 2 },
      { name: 'drivers', label: 'Driver(s)', order: 3 },
      { name: 'companies', label: 'Company(s)', order: 4 },
      { name: 'plateNumber', label: 'Plate number', order: 5 },
      { name: 'vinNumber', label: 'Vin number', order: 6 },
      { name: 'vintageYear', label: 'Vintage year', order: 7 },
      { name: 'importYear', label: 'Import year', order: 8 },
      { name: 'description', label: 'Description', order: 9 }
    ]
  }
};
