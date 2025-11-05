export const GEARBOX = {
  UNKNOWN: '',
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
  CVT: 'cvt',
  SEMI_AUTOMATIC: 'semi_automatic',
  ALL: ['', 'automatic', 'manual', 'cvt', 'semi_automatic'],
};

export const FUEL_TYPES = {
  UNKNOWN: '',
  HYBRID: 'hybrid',
  PETROL: 'petrol',
  DIESEL: 'diesel',
  FLEXIFUEL: 'flexiFuel',
  ELECTRIC: 'electric',
  ALL: ['', 'hybrid', 'petrol', 'diesel', 'flexiFuel', 'electric'],
};

export const BODY_TYPES = {
  UNKNOWN: '',
  SEDAN: 'sedan',
  SUV: 'suv',
  COMPACT: 'compact',
  WAGON: 'wagon',
  VAN: 'van',
  HATCHBACK: 'hatchback',
  PICKUP: 'pickUp',
  SPORT_COUPE: 'sport_coupe',
  ALL: [
    '',
    'sedan',
    'suv',
    'compact',
    'wagon',
    'van',
    'hatchback',
    'pickUp',
    'sport_coupe',
  ],
};

export const STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};
