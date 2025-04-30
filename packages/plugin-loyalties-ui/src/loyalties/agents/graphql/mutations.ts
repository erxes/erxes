const addEditParamDefs = `
  $number: String!,
  $customerIds: [String],
  $companyIds: [String],
  $status: AgentStatus!,
  $startDate: Date,
  $endDate: Date,
  $startMonth: Date,
  $endMonth: Date,
  $startDay: Date,
  $endDay: Date,
  $hasReturn: Boolean!,
  $returnAmount: Float,
  $returnPercent: Float,
  $prepaidPercent: Float,
  $discountPercent: Float
`;

const addEditParams = `
  number: $number,
  customerIds: $customerIds,
  companyIds: $companyIds,
  status: $status,
  startDate: $startDate
  endDate: $endDate
  startMonth: $startMonth
  endMonth: $endMonth
  startDay: $startDay
  endDay: $endDay
  hasReturn: $hasReturn,
  returnAmount: $returnAmount
  returnPercent: $returnPercent
  prepaidPercent: $prepaidPercent
  discountPercent: $discountPercent
`;

const agentsAdd = `
  mutation agentsAdd(${addEditParamDefs}) {
    agentsAdd(${addEditParams}) {
      _id
      number
    }
  }
`;

const agentsEdit = `
  mutation agentsEdit($_id: String!, ${addEditParamDefs}) {
    agentsEdit(_id: $_id, ${addEditParams}) {
      _id
      number
    }
  }
`;

export default {
  agentsAdd,
  agentsEdit
};
