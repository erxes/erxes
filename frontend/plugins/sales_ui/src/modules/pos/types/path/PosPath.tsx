export const PosPath = {
  Index: '/contacts',
  Customers: '/customers',
  Leads: '/leads',
  Companies: '/companies',
  Vendors: '/vendors',
  Clients: '/clients',
} as const;
export type PosPath = (typeof PosPath)[keyof typeof PosPath];
