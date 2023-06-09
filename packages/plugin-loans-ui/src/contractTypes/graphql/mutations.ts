import { contractTypeFields } from './queries';

const commonFields = `
  $code: String,
  $name: String,
  $description: String,
  $status: String,
  $number: String,
  $vacancy: Float,
  $unduePercent: Float,
  $undueCalcType:String
  $useMargin: Boolean
  $useDebt: Boolean
  $useSkipInterest:Boolean
  $leaseType: String
  $createdAt: Date,
  $productCategoryIds: [String],
  $config: JSON,
`;

const commonVariables = `
  code: $code,
  name: $name,
  description: $description,
  status: $status,
  number: $number,
  vacancy: $vacancy,
  unduePercent: $unduePercent
  undueCalcType: $undueCalcType
  useMargin: $useMargin
  useDebt: $useDebt
  useSkipInterest: $useSkipInterest
  leaseType: $leaseType
  createdAt: $createdAt,
  productCategoryIds: $productCategoryIds,
  config: $config,
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
