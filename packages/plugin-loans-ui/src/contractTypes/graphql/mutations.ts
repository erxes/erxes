import { contractTypeFields } from './queries';

const commonFields = `
  $code: String,
  $name: String,
  $description: String,
  $status: String,
  $number: String,
  $vacancy: Float,
  $leaseType: String,
  $currency: String,

  $defaultInterest: Float,
  $useSkipInterest: Boolean,
  $skipInterestDay: Float,
  $skipInterestMonth: Float,
  $skipPaymentDay: Float,
  $skipPaymentMonth: Float,

  $lossPercent: Float,
  $lossCalcType: String,
  $skipLossDay: Float,
  $allowLateDay: Float,

  $allowPartOfLease: Boolean,
  $limitIsCurrent: Boolean,
  $commitmentInterest: Float,

  $useMargin: Boolean,
  $useDebt: Boolean,
  $useManualNumbering: Boolean,

  $savingPlusLoanInterest: Float,
  $savingUpperPercent: Float,

  $config: JSON,
  $productId: String,
  $productType: String,

  $feePercent: Float,
  $defaultFee: Float,
  $useCollateral: Boolean,
  $minPercentMargin: Float,

  $overPaymentIsNext: Boolean,
  $collectivelyRule: String,
`;

const commonVariables = `
  code: $code,
  name: $name,
  description: $description,
  status: $status,
  number: $number,
  vacancy: $vacancy,
  leaseType: $leaseType,
  currency: $currency,

  defaultInterest: $defaultInterest,
  useSkipInterest: $useSkipInterest,
  skipInterestDay: $skipInterestDay,
  skipInterestMonth: $skipInterestMonth,
  skipPaymentDay: $skipPaymentDay,
  skipPaymentMonth: $skipPaymentMonth,

  lossPercent: $lossPercent,
  lossCalcType: $lossCalcType,
  skipLossDay: $skipLossDay,
  allowLateDay: $allowLateDay,

  allowPartOfLease: $allowPartOfLease,
  limitIsCurrent: $limitIsCurrent,
  commitmentInterest: $commitmentInterest,

  useMargin: $useMargin,
  useDebt: $useDebt,
  useManualNumbering: $useManualNumbering,

  savingPlusLoanInterest: $savingPlusLoanInterest,
  savingUpperPercent: $savingUpperPercent,

  config: $config,
  productId: $productId,
  productType: $productType,

  feePercent: $feePercent,
  defaultFee: $defaultFee,
  useCollateral: $useCollateral,
  minPercentMargin: $minPercentMargin,

  overPaymentIsNext: $overPaymentIsNext,
  collectivelyRule: $collectivelyRule,
`;

const contractTypesAdd = `
  mutation contractTypesAdd(${commonFields}) {
    contractTypesAdd(${commonVariables}) {
      ${contractTypeFields}
    }
  }
`;

const contractTypesEdit = `
  mutation contractTypesEdit($_id: String!, ${commonFields}) {
    contractTypesEdit(_id: $_id, ${commonVariables}) {
      ${contractTypeFields}
    }
  }
`;

const contractTypesRemove = `
  mutation contractTypesRemove($contractTypeIds: [String]) {
    contractTypesRemove(contractTypeIds: $contractTypeIds)
  }
`;

export default {
  contractTypesAdd,
  contractTypesEdit,
  contractTypesRemove
};
