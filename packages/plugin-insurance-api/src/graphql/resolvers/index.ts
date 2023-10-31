import customScalars from '@erxes/api-utils/src/customScalars';
import { Risk } from './risks';
import { InsuranceProduct, InsuranceProductOfVendor } from './products';
import mutations from './mutations';
import queries from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Risk,
  InsuranceProduct,
  InsuranceProductOfVendor,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
