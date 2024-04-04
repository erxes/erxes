import {
  commonFields,
  commonFilterDefs,
  commonFilterValues,
  paginateDefs,
  paginateValues
} from '../../commonTypes';

export const donateCampaignFields = `
  _id
  ${commonFields}
  maxScore
  awards

  donatesCount
`;

const donateCampaigns = `
  query donateCampaigns(${commonFilterDefs} ${paginateDefs}) {
    donateCampaigns(${commonFilterValues} ${paginateValues}) {
      ${donateCampaignFields}
    }
  }
`;

const donateCampaignsCount = `
  query donateCampaignsCount(${commonFilterDefs}) {
    donateCampaignsCount(${commonFilterValues})
  }
`;

const donateCampaignDetail = `
  query donateCampaignDetail($_id: String!) {
    donateCampaignDetail(_id: $_id) {
      ${donateCampaignFields}
    }
  }
`;

export default {
  donateCampaigns,
  donateCampaignsCount,
  donateCampaignDetail
};
