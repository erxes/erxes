import customScalars from '@erxes/api-utils/src/customScalars';
import { Risk } from './risks';
import { InsurancePackage } from './insurancePackage';
import { InsuranceProduct, InsuranceProductOfVendor } from './products';
import { InsuranceCategory } from './insuranceCategory';
import { RiskConfig } from './riskConfig';

import mutations from './mutations';
import queries from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Risk,
  InsuranceProduct,
  InsuranceProductOfVendor,
  InsurancePackage,
  InsuranceCategory,
  RiskConfig,

  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
