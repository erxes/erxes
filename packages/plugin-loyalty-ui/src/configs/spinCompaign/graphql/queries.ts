import { commonFields, commonFilterDefs, commonFilterValues, paginateDefs, paginateValues } from '../../commonTypes';

export const spinCompaignFields = `
  _id
  ${commonFields}
  buyScore
  awards

  spinsCount
`;

const spinCompaigns = `
  query spinCompaigns(${commonFilterDefs} ${paginateDefs}) {
    spinCompaigns(${commonFilterValues} ${paginateValues}) {
      ${spinCompaignFields}
    }
  }
`;

const spinCompaignsCount = `
  query spinCompaignsCount(${commonFilterDefs}) {
    spinCompaignsCount(${commonFilterValues})
  }
`;

const spinCompaignDetail = `
  query spinCompaignDetail($_id: String!) {
    spinCompaignDetail(_id: $_id) {
      ${spinCompaignFields}
    }
  }
`;

export default {
  spinCompaigns,
  spinCompaignsCount,
  spinCompaignDetail
};
