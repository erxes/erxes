export const COLORS = [
  '#01aecc',
  '#D9E3F0',
  '#ffffff',
  '#F47373',
  '#697689',
  '#4bbf6b',
  '#0078bf',
  '#89609d',
  '#838c91',
  '#cd5a91',
  '#d29034',
  '#63D2D6',
  '#F7CE53',
  '#ff0000',
  '#000000'
];

export const CAR_INFO = {
  description: 'Description',

  plateNumber: 'Plate number',
  vinNumber: 'Vin number',
  colorCode: 'Color',
  bodyType: 'Body type',
  fuelType: 'Fuel type',
  gearBox: 'Gear box',
  vintageYear: 'Vintage year',
  importYear: 'Import year',
  attachment: 'Attachment',

  ALL: [
    { field: 'plateNumber', label: 'Plate number' },
    { field: 'vinNumber', label: 'Vin number' },
    { field: 'colorCode', label: 'Color' },

    { field: 'bodyType', label: 'Body type' },
    { field: 'fuelType', label: 'Fuel type' },
    { field: 'gearBox', label: 'Gear box' },
    { field: 'vintageYear', label: 'Vintage year' },
    { field: 'importYear', label: 'Import year' },
    { field: 'description', label: 'Description' },
    { field: 'attachment', label: 'Attachment' }
  ]
};

export const CAR_DATAS = {
  owner: 'Owner',
  category: 'Category',

  ALL: [
    { field: 'owner', label: 'Owner' },
    { field: 'category', label: 'Category' }
  ]
};

export const CAR_BODY_TYPES = [
  { label: 'Unknown', value: '' },
  { label: 'Sedan', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Compact', value: 'Compact' },
  { label: 'Wagon', value: 'Wagon' },
  { label: 'Coupe', value: 'Coupe' },
  { label: 'Van', value: 'Van' },
  { label: 'Hatchback', value: 'Hatchback' },
  { label: 'Pickup', value: 'Pickup' },
  { label: 'Sport Coupe', value: 'SportCoupe' }
];

export const CAR_FUEL_TYPES = [
  { label: 'Unknown', value: '' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'Petrol', value: 'Petrol' },
  { label: 'Diesel', value: 'Diesel' },
  { label: 'FlexiFuel', value: 'FlexiFuel' },
  { label: 'Electric', value: 'Electric' }
];

export const CAR_GEAR_BOXS = [
  { label: 'Unknown', value: '' },
  { label: 'Automatic', value: 'Automatic' },
  { label: 'Manual', value: 'Manual' },
  { label: 'CVT', value: 'CVT' },
  { label: 'Semi automatic', value: 'SemiAutomatic' }
];
