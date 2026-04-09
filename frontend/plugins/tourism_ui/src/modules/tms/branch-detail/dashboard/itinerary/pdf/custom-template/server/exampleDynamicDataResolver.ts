export interface TravelRecordData {
  tour: {
    title: string;
    destination: string;
    durationDays: number;
  };
  pricing: {
    startingFrom: number;
    currency: string;
  };
  itinerary: {
    days: Array<{
      title: string;
      content: string;
    }>;
  };
  included: string[];
  excluded: string[];
  hotels: Array<{
    name: string;
    stars: number;
  }>;
  transport: Array<{
    mode: string;
    details: string;
  }>;
  contact: {
    email: string;
    phone: string;
  };
}

export const createExampleTravelRecord = (): TravelRecordData => ({
  tour: {
    title: 'Shanghai City Escape',
    destination: 'Shanghai, China',
    durationDays: 4,
  },
  pricing: {
    startingFrom: 690000,
    currency: 'MNT',
  },
  itinerary: {
    days: [
      {
        title: 'Arrival and transfer',
        content: 'Arrival in Shanghai, hotel check-in, dinner, and rest.',
      },
      {
        title: 'City discovery',
        content: 'Bund, Yu Garden, City God Temple, and river cruise.',
      },
    ],
  },
  included: ['Airport transfer', 'Hotel stay', 'Guide service'],
  excluded: ['Travel insurance', 'Personal expenses'],
  hotels: [
    {
      name: 'Central Shanghai Hotel',
      stars: 4,
    },
  ],
  transport: [
    {
      mode: 'Flight',
      details: 'Ulaanbaatar to Shanghai round trip',
    },
  ],
  contact: {
    email: 'sales@example.travel',
    phone: '+976 7000 0000',
  },
});
