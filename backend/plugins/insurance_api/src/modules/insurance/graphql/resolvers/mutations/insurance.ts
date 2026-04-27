import { riskTypeMutations } from './riskType';
import { insuranceTypeMutations } from './insuranceType';
import { productMutations } from './product';
import { vendorMutations } from './vendor';
import { vendorUserMutations } from './vendorUser';
import { customerMutations } from './customer';
import { contractMutations } from './contract';
import { contractPdfMutations } from './contractPdf';
import { templateMutations } from './template';
import { regionMutations } from './region';

export const insuranceMutations = {
  ...riskTypeMutations,
  ...insuranceTypeMutations,
  ...productMutations,
  ...vendorMutations,
  ...vendorUserMutations,
  ...customerMutations,
  ...contractMutations,
  ...contractPdfMutations,
  ...templateMutations,
  ...regionMutations,
};
