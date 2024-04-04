import {
  commonFields,
  commonFilterDefs,
  commonFilterValues,
  paginateDefs,
  paginateValues
} from '../../commonTypes';

export const lotteryCampaignFields = `
  _id
  ${commonFields}
  numberFormat
  buyScore
  awards

  lotteriesCount
`;

const lotteryCampaigns = `
  query lotteryCampaigns(${commonFilterDefs} ${paginateDefs}) {
    lotteryCampaigns(${commonFilterValues} ${paginateValues}) {
      ${lotteryCampaignFields}
    }
  }
`;

const lotteryCampaignsCount = `
  query lotteryCampaignsCount(${commonFilterDefs}) {
    lotteryCampaignsCount(${commonFilterValues})
  }
`;

const lotteryCampaignDetail = `
  query lotteryCampaignDetail($_id: String!) {
    lotteryCampaignDetail(_id: $_id) {
      ${lotteryCampaignFields}
    }
  }
`;

export default {
  lotteryCampaigns,
  lotteryCampaignsCount,
  lotteryCampaignDetail
};
