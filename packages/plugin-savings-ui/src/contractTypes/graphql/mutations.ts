import { contractTypeFields } from './queries';

const commonFields = `
  $code: String,
  $name: String,
  $status: String,
  $number: String,
  $vacancy: Float,
  $createdAt: Date,
  $config: JSON,
  $isAllowIncome:Boolean,
  $isAllowOutcome:Boolean,
  $interestCalcType:String,
  $interestRate: Float,
  $closeInterestRate: Float,
  $storeInterestInterval:String,
  $description:String,
  $currency:String,
  $branchId:String,
`;

const commonVariables = `
  code:$code
  name:$name
  status:$status
  number:$number
  vacancy:$vacancy
  createdAt:$createdAt
  config:$config
  isAllowIncome:$isAllowIncome
  isAllowOutcome:$isAllowOutcome
  interestCalcType:$interestCalcType
  interestRate:$interestRate,
  closeInterestRate:$closeInterestRate,
  storeInterestInterval:$storeInterestInterval
  description:$description
  currency:$currency
  branchId:$branchId
`;

const contractTypesAdd = `
  mutation savingsContractTypesAdd(${commonFields}) {
    savingsContractTypesAdd(${commonVariables}) {
      ${contractTypeFields}
    }
  }
`;

const contractTypesEdit = `
  mutation savingsContractTypesEdit($_id: String!, ${commonFields}) {
    savingsContractTypesEdit(_id: $_id, ${commonVariables}) {
      ${contractTypeFields}
    }
  }
`;

const contractTypesRemove = `
  mutation savingsContractTypesRemove($contractTypeIds: [String]) {
    savingsContractTypesRemove(contractTypeIds: $contractTypeIds)
  }
`;

export default {
  contractTypesAdd,
  contractTypesEdit,
  contractTypesRemove
};
