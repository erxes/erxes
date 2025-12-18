
import { riskTypeQueries } from './riskType';
import { insuranceTypeQueries } from './insuranceType';
import { productQueries } from './product';
import { vendorQueries } from './vendor';
import { customerQueries } from './customer';
import { contractQueries } from './contract';

export const insuranceQueries = {
  ...riskTypeQueries,
  ...insuranceTypeQueries,
  ...productQueries,
  ...vendorQueries,
  ...customerQueries,
  ...contractQueries,
};
