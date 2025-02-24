import { contractDetailFields } from './queries';

const commonFields = `
  $contractTypeId: String
  $number: String
  $useManualNumbering: Boolean
  $foreignNumber: String
  $relContractId: String
  $dealId: String
  $currency: String
  
  $status: String
  $statusChangedDate: Date

  $classification: String
  $branchId: String
  $description: String
  $createdBy: String
  $createdAt: Date
  $modifiedBy: String
  $modifiedAt: Date

  $marginAmount: Float
  $leaseAmount: Float
  $feeAmount: Float

  $tenor: Float
  $repayment: String
  $interestRate: Float
  $lossPercent: Float
  $lossCalcType: String

  $contractDate: Date
  $startDate: Date
  $firstPayDate: Date
  $endDate: Date
  $scheduleDays: [Int]
  $stepRules: [JSON]

  $insuranceAmount: Float
  $debt: Float
  $debtTenor: Float
  $debtLimit: Float

  $collateralsData: [JSON]
  $insurancesData: [JSON]

  $customerType: String
  $customerId: String
  $relCustomers: [JSON]

  $relationExpertId: String
  $leasingExpertId: String
  $riskExpertId: String

  $closeDate: Date
  $closeType: String
  $closeDescription: String

  $loanPurpose: String
  $loanDestination: String
  $leaseType: String

  $customFieldsData: JSON
  $savingContractId: String
  $depositAccountId: String

  $holidayType: String
  $weekends: [Int]
`;

const commonVariables = `
  contractTypeId: $contractTypeId
  number: $number
  useManualNumbering: $useManualNumbering
  foreignNumber: $foreignNumber
  relContractId: $relContractId
  dealId: $dealId
  currency: $currency
  
  status: $status
  statusChangedDate: $statusChangedDate

  classification: $classification
  branchId: $branchId
  description: $description
  createdBy: $createdBy
  createdAt: $createdAt
  modifiedBy: $modifiedBy
  modifiedAt: $modifiedAt

  marginAmount: $marginAmount
  leaseAmount: $leaseAmount
  feeAmount: $feeAmount

  tenor: $tenor
  repayment: $repayment
  interestRate: $interestRate
  lossPercent: $lossPercent
  lossCalcType: $lossCalcType

  contractDate: $contractDate
  startDate: $startDate
  firstPayDate: $firstPayDate
  endDate: $endDate
  scheduleDays: $scheduleDays
  stepRules: $stepRules

  insuranceAmount: $insuranceAmount
  debt: $debt
  debtTenor: $debtTenor
  debtLimit: $debtLimit

  collateralsData: $collateralsData
  insurancesData: $insurancesData

  customerType: $customerType
  customerId: $customerId
  relCustomers: $relCustomers

  relationExpertId: $relationExpertId
  leasingExpertId: $leasingExpertId
  riskExpertId: $riskExpertId

  closeDate: $closeDate
  closeType: $closeType
  closeDescription: $closeDescription

  loanPurpose: $loanPurpose
  loanDestination: $loanDestination
  leaseType: $leaseType

  customFieldsData: $customFieldsData
  savingContractId: $savingContractId
  depositAccountId: $depositAccountId

  holidayType: $holidayType
  weekends: $weekends
`;

const contractsAdd = `
  mutation contractsAdd(${commonFields}) {
    contractsAdd(${commonVariables}) {
      _id
      number
      contractTypeId
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

const contractsDealEdit = `
  mutation contractsDealEdit($_id: String!, $dealId: String) {
    contractsDealEdit(_id: $_id, dealId: $dealId) {
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
  mutation InterestChange($contractId: String, $stoppedDate: Date, $isStopLoss: Boolean, $interestAmount: Float, $lossAmount: Float) {
    interestChange(contractId: $contractId, stoppedDate: $stoppedDate, isStopLoss: $isStopLoss, interestAmount: $interestAmount, lossAmount: $lossAmount) {
      _id
    }
  }
`;

const interestReturn = `
  mutation InterestReturn($contractId: String, $stoppedDate: Date, $isStopLoss: Boolean, $interestAmount: Float, $lossAmount: Float) {
    interestReturn(contractId: $contractId, stoppedDate: $stoppedDate, isStopLoss: $isStopLoss, interestAmount: $interestAmount, lossAmount: $lossAmount) {
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
};
