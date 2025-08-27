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
  $productRuleIds: [String]
`;

const addEditParams = `
  number: $number,
  customerIds: $customerIds,
  companyIds: $companyIds,
  status: $status,
  startDate: $startDate,
  endDate: $endDate,
  startMonth: $startMonth,
  endMonth: $endMonth,
  startDay: $startDay,
  endDay: $endDay,
  hasReturn: $hasReturn,
  productRuleIds: $productRuleIds
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

const agentsRemove = `
  mutation agentsRemove($_id: String!) {
    agentsRemove(_id: $_id)
  }
`;

export default {
  agentsAdd,
  agentsEdit,
  agentsRemove
};
