import { companyQueries } from './company';
import { customerQueries } from './customer';

export const contactQueries = {
  ...customerQueries,
  ...companyQueries,
};
