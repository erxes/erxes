import customScalars from '@erxes/api-utils/src/customScalars';
import CustomerMutations from './customerMutations';
import CustomerQueries from './customerQueries';
import CompanyQueries from './companyQueries';
import CompanyMutations from './companyMutations';
import Customer from './customer';
import Company from './company';

const resolvers: any = {
  ...customScalars,
  Customer,
  Company,
  Mutation: {
    ...CustomerMutations,
    ...CompanyMutations
  },
  Query: {
    ...CustomerQueries,
    ...CompanyQueries
  }
};

export default resolvers;
