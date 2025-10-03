export const PAYMENT_STATUS_TYPES = [
  { label: 'paid', value: 'paid' },
  { label: 'notPaid', value: 'notPaid' },
  { label: 'somePaid', value: 'somePaid' },
];

export const TOUR_STATUS_TYPES = [
  { label: 'running', value: 'running' },
  { label: 'completed', value: 'completed' },
  { label: 'scheduled', value: 'scheduled' },
  { label: 'cancelled', value: 'cancelled' },
];

export const CATEGORIES = [
  {
    name: 'Accommodation',
    children: [
      { name: 'Hotel', children: [] },
      { name: 'Resort' },
      { name: 'Guesthouse' },
      { name: 'Vacation Rental' },
      { name: 'Hostel' },
      { name: 'Camping' },
      { name: 'Lodge' },
      { name: 'Motel' },
      { name: 'Villa' },
    ],
  },
  {
    name: 'Places',
    children: [
      {
        name: 'Natural Attractions',
        children: [
          { name: 'Beaches' },
          { name: 'Mountains' },
          { name: 'Deserts' },
          { name: 'Forests & Jungles' },
          { name: 'Lakes & Rivers' },
          { name: 'Waterfalls' },
          { name: 'Islands' },
        ],
      },
      {
        name: 'Cultural & Historical Sites',
        children: [
          { name: 'Ancient Ruins' },
          { name: 'Temples & Monasteries' },
          { name: 'Museums & Art Galleries' },
          { name: 'Historical Cities' },
          { name: 'Castles & Palaces' },
        ],
      },
      {
        name: 'Urban Destinations',
        children: [
          { name: 'Metropolitan Cities' },
          { name: 'Skyscraper Cities' },
          { name: 'Old Towns & Quarters' },
          { name: 'Technology Hubs' },
        ],
      },
      {
        name: 'Adventure & Outdoor Recreation',
        children: [
          { name: 'National Parks' },
          { name: 'Hiking Trails' },
          { name: 'Ski Resorts' },
          { name: 'Diving & Snorkeling Spots' },
          { name: 'Rock Climbing Destinations' },
        ],
      },
      {
        name: 'Relaxation & Wellness',
        children: [
          { name: 'Spa Towns' },
          { name: 'Yoga Retreats' },
          { name: 'Hot Springs' },
          { name: 'Quiet Countryside' },
        ],
      },
    ],
  },
  {
    name: 'Activity',
    children: [
      { name: 'Sightseeing' },
      { name: 'Hiking' },
      { name: 'Camping' },
      { name: 'Shopping' },
      { name: 'Cultural Tours' },
      { name: 'Food Tours' },
      { name: 'Adventure Sports' },
      { name: 'Water Sports' },
      { name: 'Wildlife Safaris' },
      { name: 'Skiing/Snowboarding' },
      { name: 'Beach Activities' },
      { name: 'City Tours' },
      { name: 'Boat Tours/Cruises' },
      { name: 'Photography' },
    ],
  },
  {
    name: 'Food & Drink',
    children: [
      { name: 'Street Food' },
      { name: 'Local Cuisine' },
      { name: 'Fine Dining' },
      { name: 'Café' },
      { name: 'Beverages' },
      { name: 'Desserts and Sweets' },
      { name: 'Vegetarian/Vegan Options' },
      { name: 'Food Markets' },
      { name: 'Picnics and Outdoor Dining' },
      { name: 'Fast Food' },
    ],
  },

  {
    name: 'Location',
    children: [
      {
        name: 'Mongolia',
        children: [
          { name: 'Arkhangai' },
          { name: 'Bayan-Ölgii' },
          { name: 'Bayankhongor' },
          { name: 'Bulgan' },
          { name: 'Darkhan-Uul' },
          { name: 'Dornod' },
          { name: 'Dornogovi' },
          { name: 'Dundgovi' },
          { name: 'Govi-Altai' },
          { name: 'Ulaanbaatar' },
        ],
      },
    ],
  },
];
