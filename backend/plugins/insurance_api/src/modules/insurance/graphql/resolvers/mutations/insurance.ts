
import { riskTypeMutations } from './riskType';
import { insuranceTypeMutations } from './insuranceType';
import { productMutations } from './product';
import { vendorMutations } from './vendor';
import { customerMutations } from './customer';
import { contractMutations } from './contract';

export const insuranceMutations = {
  ...riskTypeMutations,
  ...insuranceTypeMutations,
  ...productMutations,
  ...vendorMutations,
  ...customerMutations,
  ...contractMutations,
};

