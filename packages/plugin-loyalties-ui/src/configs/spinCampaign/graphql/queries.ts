import {
  commonFields,
  commonFilterDefs,
  commonFilterValues,
  paginateDefs,
  paginateValues
} from '../../commonTypes';

export const spinCampaignFields = `
  _id
  ${commonFields}
  buyScore
  awards

  spinsCount
`;

const spinCampaigns = `
  query spinCampaigns(${commonFilterDefs} ${paginateDefs}) {
    spinCampaigns(${commonFilterValues} ${paginateValues}) {
      ${spinCampaignFields}
    }
  }
`;

const spinCampaignsCount = `
  query spinCampaignsCount(${commonFilterDefs}) {
    spinCampaignsCount(${commonFilterValues})
  }
`;

const spinCampaignDetail = `
  query spinCampaignDetail($_id: String!) {
    spinCampaignDetail(_id: $_id) {
      ${spinCampaignFields}
    }
  }
`;

export default {
  spinCampaigns,
  spinCampaignsCount,
  spinCampaignDetail
};
