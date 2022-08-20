import { contractDetailFields } from './queries';

const commonFields = `
  $contractTypeId: String,
  $number: String,
  $status: String,
  $description: String,
  $createdBy: String,
  $createdAt: Date,
  $marginAmount: Float,
  $leaseAmount: Float,
  $feeAmount: Float,
  $tenor: Float,
  $interestRate: Float,
  $repayment: String,
  $startDate: Date,
  $scheduleDay: Float,

  $collateralsData: JSON,
  $insurancesData: JSON,

  $debt: Float
  $debtTenor: Float
  $debtLimit: Float

  $salvageAmount: Float
  $salvagePercent: Float
  $salvageTenor: Float

  $relationExpertId: String
  $leasingExpertId: String
  $riskExpertId: String
  $weekends: [Int]
  $useHoliday: Boolean

  $relContractId: String
`;

const commonVariables = `
  contractTypeId: $contractTypeId,
  number: $number,
  status: $status,
  description: $description,
  createdBy: $createdBy,
  createdAt: $createdAt,
  marginAmount: $marginAmount,
  leaseAmount: $leaseAmount,
  feeAmount: $feeAmount,
  tenor: $tenor,
  interestRate: $interestRate,
  repayment: $repayment,
  startDate: $startDate,
  scheduleDay: $scheduleDay,

  collateralsData: $collateralsData,
  insurancesData: $insurancesData,

  salvageAmount: $salvageAmount
  salvagePercent: $salvagePercent
  salvageTenor: $salvageTenor

  debt: $debt
  debtTenor: $debtTenor
  debtLimit: $debtLimit

  relationExpertId: $relationExpertId
  leasingExpertId: $leasingExpertId
  riskExpertId: $riskExpertId
  weekends: $weekends
  useHoliday: $useHoliday

  relContractId: $relContractId
`;

const contractsAdd = `
  mutation contractsAdd(${commonFields}) {
    contractsAdd(${commonVariables}) {
      _id
      ${contractDetailFields}
    }
  }
`;

const contractsEdit = `
  mutation contractsEdit($_id: String!, ${commonFields}) {
    contractsEdit(_id: $_id, ${commonVariables}) {
      _id
      ${contractDetailFields}
    }
  }
`;

const contractsRemove = `
  mutation contractsRemove($contractIds: [String]) {
    contractsRemove(contractIds: $contractIds)
  }
`;

const getProductsData = `
  mutation getProductsData($contractId: String) {
    getProductsData(contractId: $contractId) {
      collateralsData
    }
  }
`;

const contractConfirm = `
  mutation contractConfirm($contractId: String) {
    contractConfirm(contractId: $contractId) {
      result
    }
  }
`;

const contractsClose = `
  mutation contractsClose($contractId: String, $closeDate: Date, $closeType: String, $description: String) {
    contractsClose(contractId: $contractId, closeDate: $closeDate, closeType: $closeType, description: $description) {
      _id
      ${contractDetailFields}
    }
  }
`;

const regenSchedules = `
  mutation regenSchedules($contractId: String!) {
    regenSchedules(contractId: $contractId)
  }
`;

export default {
  contractsAdd,
  contractsEdit,
  contractsRemove,
  regenSchedules,
  contractConfirm,
  contractsClose,
  getProductsData
};
