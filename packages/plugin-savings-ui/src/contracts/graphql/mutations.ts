import { contractDetailFields } from './queries';

const commonFields = `
  $contractTypeId: String, 
  $number: String, 
  $branchId: String, 
  $status: String, 
  $createdBy: String, 
  $description: String, 
  $savingAmount: Float, 
  $createdAt: Date, 
  $duration: Float, 
  $interestRate: Float, 
  $closeInterestRate: Float, 
  $startDate: Date, 
  $customerId: String, 
  $customerType: String, 
  $dealId: String, 
  $currency: String,
  $interestGiveType: String,
  $closeOrExtendConfig: String,
  $depositAccount: String,
  $storeInterestInterval: String
  $interestCalcType: String
  $isAllowIncome: Boolean
  $isAllowOutcome: Boolean
  $isDeposit: Boolean
`;

const commonVariables = `
  contractTypeId: $contractTypeId,
  number: $number,
  branchId: $branchId,
  status: $status,
  createdBy: $createdBy,
  description: $description,
  savingAmount: $savingAmount,
  createdAt: $createdAt,
  duration: $duration,
  interestRate: $interestRate,
  closeInterestRate: $closeInterestRate,
  startDate: $startDate,
  customerId: $customerId,
  customerType: $customerType,
  dealId: $dealId,
  currency: $currency,
  interestGiveType: $interestGiveType,
  closeOrExtendConfig: $closeOrExtendConfig,
  depositAccount: $depositAccount,
  storeInterestInterval: $storeInterestInterval,
  interestCalcType: $interestCalcType,
  isAllowIncome:$isAllowIncome,
  isAllowOutcome:$isAllowOutcome,
  isDeposit:$isDeposit,
`;

const contractsAdd = `
  mutation savingsContractsAdd(${commonFields}) {
    savingsContractsAdd(${commonVariables}) {
      _id
      number
      contractTypeId
      ${contractDetailFields}
    }
  }
`;

const contractsEdit = `
  mutation savingsContractsEdit($_id: String!, ${commonFields}) {
    savingsContractsEdit(_id: $_id, ${commonVariables}) {
      _id
      ${contractDetailFields}
    }
  }
`;

const contractsDealEdit = `
  mutation savingsContractsDealEdit($_id: String!, ${commonFields}) {
    savingsContractsEdit(_id: $_id, ${commonVariables}) {
      _id
      ${contractDetailFields}
    }
  }
`;

const contractsRemove = `
  mutation savingsContractsRemove($contractIds: [String]) {
    savingsContractsRemove(contractIds: $contractIds)
  }
`;

const getProductsData = `
  mutation getProductsData($contractId: String) {
    getProductsData(contractId: $contractId) {
      collateralsData
    }
  }
`;

const contractsClose = `
  mutation savingsContractsClose($contractId: String, $closeDate: Date, $closeType: String, $description: String) {
    savingsContractsClose(contractId: $contractId, closeDate: $closeDate, closeType: $closeType, description: $description) {
      _id
      ${contractDetailFields}
    }
  }
`;
const expandContract = `
  mutation SavingsExpandDuration($id: String!,$contractTypeId: String) {
    savingsExpandDuration(_id: $id,contractTypeId:$contractTypeId) {
      _id
    }
  }
`;

const regenSchedules = `
  mutation regenSchedules($contractId: String!) {
    regenSchedules(contractId: $contractId)
  }
`;

const fixSchedules = `
  mutation fixSchedules($contractId: String!) {
    fixSchedules(contractId: $contractId)
  }
`;

const changeClassification = `
  mutation ClassificationsAdd($classifications: JSON) {
    classificationsAdd(classifications: $classifications) {
      _id
      description
      invDate
      classification
      total
      newClassification
      dtl {
        amount
        contractId
        currency
      }
    }
  }
`;

const stopInterest = `
mutation StopInterest($contractId: String, $stoppedDate: Date, $interestAmount: Float, $isStopLoss: Boolean, $lossAmount: Float) {
  stopInterest(contractId: $contractId, stoppedDate: $stoppedDate, interestAmount: $interestAmount, isStopLoss: $isStopLoss, lossAmount: $lossAmount) {
    _id
  }
}
`;
const interestChange = `
  mutation savingsInterestChange($contractId: String, $stoppedDate: Date, $isStopLoss: Boolean, $interestAmount: Float, $lossAmount: Float) {
    savingsInterestChange(contractId: $contractId, stoppedDate: $stoppedDate, isStopLoss: $isStopLoss, interestAmount: $interestAmount, lossAmount: $lossAmount) {
      _id
    }
  }
`;

const interestReturn = `
  mutation savingsInterestReturn($contractId: String, $stoppedDate: Date, $isStopLoss: Boolean, $interestAmount: Float, $lossAmount: Float) {
    savingsInterestReturn(contractId: $contractId, stoppedDate: $stoppedDate, isStopLoss: $isStopLoss, interestAmount: $interestAmount, lossAmount: $lossAmount) {
      _id
    }
  }
`;

export default {
  contractsAdd,
  contractsEdit,
  contractsDealEdit,
  contractsRemove,
  regenSchedules,
  fixSchedules,
  contractsClose,
  getProductsData,
  changeClassification,
  stopInterest,
  interestChange,
  interestReturn,
  expandContract
};
