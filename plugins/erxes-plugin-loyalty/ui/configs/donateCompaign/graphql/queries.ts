import { commonFields, commonFilterDefs, commonFilterValues, paginateDefs, paginateValues } from '../../commonTypes';

export const donateCompaignFields = `
  _id
  ${commonFields}
  maxScore
  awards

  donatesCount
`;

const donateCompaigns = `
  query donateCompaigns(${commonFilterDefs} ${paginateDefs}) {
    donateCompaigns(${commonFilterValues} ${paginateValues}) {
      ${donateCompaignFields}
    }
  }
`;

const donateCompaignsCount = `
  query donateCompaignsCount(${commonFilterDefs}) {
    donateCompaignsCount(${commonFilterValues})
  }
`;

const donateCompaignDetail = `
  query donateCompaignDetail($_id: String!) {
    donateCompaignDetail(_id: $_id) {
      ${donateCompaignFields}
    }
  }
`;

export default {
  donateCompaigns,
  donateCompaignsCount,
  donateCompaignDetail
};
