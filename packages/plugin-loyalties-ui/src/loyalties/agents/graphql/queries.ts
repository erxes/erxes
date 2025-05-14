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

const listParamDefs = `
  $number: String,
  $status: String,
  $hasReturn: Boolean,
  $customerIds: [String],
  $companyIds: [String],
`;
const listParams = `
  number: $number,
  status: $status,
  hasReturn: $hasReturn,
  customerIds: $customerIds,
  companyIds: $companyIds
`;

const pageParamDefs = `$page: Int, $perPage: Int, $sortField: String, $sortDirection: String`;
const pageParams = `page: $page, perPage: $perPage, sortField: $sortField, sortDirection: $sortDirection`;

const agentsMain = `
  query agentsMain(${pageParamDefs}, ${listParamDefs}) {
    agentsMain(${pageParams}, ${listParams}) {
      list {
        ${agentFields}
      }
      totalCount
    }
  }
`;

export default {
  agents,
  agentDetail,
  agentsMain
};
