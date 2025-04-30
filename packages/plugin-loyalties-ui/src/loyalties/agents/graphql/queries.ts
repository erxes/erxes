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
  productRules {
    categoryIds
    excludeCategoryIds
    productIds
    excludeProductIds
    tagIds
    excludeTagIds
    unitPrice
    bundleId
  }
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
