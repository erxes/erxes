export const BOOKING_CONTENT_ACTION = {
  ONEPAGE: 'onePage',
  TWOPAGE: 'twoPage',
  THREEPAGE: 'threePage',
  ALL_LIST: [
    { label: '1 page', value: 'onePage' },
    { label: '2 page', value: 'twoPage' },
    { label: '3 page', value: 'threePage' }
  ]
};

export const BOOKING_ITEM_SHAPE = {
  TRIANGLE: 'triangle',
  CIRCLE: 'circle',
  SQUARE: 'square',
  ALL_LIST: [
    { label: 'Triangle', value: 'triangle' },
    { label: 'Circle', value: 'circle' },
    { label: 'Square', value: 'square' }
  ]
};

export const USER_FILTERS = {
  ALL_LIST: [
    { label: 'Sqm', value: 'sqm' },
    { label: 'Bedrooms', value: 'bedrooms' },
    { label: 'Bathrooms', value: 'bathrooms' }
  ]
};

export const PRODUCT_PROPERTIES = {
  ALL_LIST: [
    { label: 'Title', value: 'title' },
    { label: 'Description', value: 'description' },
    { label: 'Sqm', value: 'sqm' },
    { label: 'Bedrooms', value: 'bedrooms' }
  ]
};
