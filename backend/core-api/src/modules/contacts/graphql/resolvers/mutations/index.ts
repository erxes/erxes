import { companyMutations } from './company';
import { customerMutations } from './customer';

export const contactMutations = {
  ...customerMutations,
  ...companyMutations,
};
