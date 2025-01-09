import { contractTypeFields } from './queries';

const commonFields = `
  $code: String,
  $name: String,
  $description: String,
  $status: String,
  $number: String,
  $vacancy: Float,
  $lossPercent: Float,
  $lossCalcType:String
  $useMargin: Boolean
  $useDebt: Boolean
  $useSkipInterest:Boolean
  $useManualNumbering:Boolean
  $useFee:Boolean
  $leaseType: String
  $commitmentInterest: Float
  $createdAt: Date,
  $config: JSON,
  $currency: String,
  $savingPlusLoanInterest:Float,
  $savingUpperPercent:Float,
  $usePrePayment:Boolean
  $invoiceDay:String
  $customFieldsData: JSON
  $productId: String
  $productType: String
`;

const commonVariables = `
  code: $code,
  name: $name,
  description: $description,
  status: $status,
  number: $number,
  vacancy: $vacancy,
  lossPercent: $lossPercent
  lossCalcType: $lossCalcType
  useMargin: $useMargin
  useDebt: $useDebt
  useSkipInterest: $useSkipInterest
  useManualNumbering: $useManualNumbering
  useFee: $useFee
  leaseType: $leaseType
  commitmentInterest: $commitmentInterest
  createdAt: $createdAt,
  config: $config,
  currency: $currency,
  savingPlusLoanInterest: $savingPlusLoanInterest,
  savingUpperPercent: $savingUpperPercent,
  usePrePayment: $usePrePayment,
  invoiceDay: $invoiceDay,
  customFieldsData: $customFieldsData,
  productId: $productId,
  productType: $productType
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
