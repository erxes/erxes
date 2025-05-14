const agentFields = `
  _id
  number
  customerIds
  companyIds
  status
  startDate
  endDate
  startMonth
  endMonth
  startDay
  endDay
  hasReturn
  returnAmount
  returnPercent
  prepaidPercent
  discountPercent
  productRuleIds

  rulesOfProducts
`;

const agents = `
  query agents {
    agents {
      ${agentFields}
    }
  }
`;

const agentDetail = `
  query agentDetail {
    agentDetail {
      ${agentFields}
    }
  }
`;

export default {
  agents,
  agentDetail
};
