import {
  commonFields,
  commonFilterDefs,
  commonFilterValues,
  paginateDefs,
  paginateValues
} from '../../commonTypes';

export const assignmentCampaignFields = `
  _id
  ${commonFields}
`;

const assignmentCampaigns = `
  query assignmentCampaigns(${commonFilterDefs} ${paginateDefs}) {
    assignmentCampaigns(${commonFilterValues} ${paginateValues}) {
      ${assignmentCampaignFields}
    }
  }
`;

const assignmentCampaignsCount = `
  query assignmentCampaignsCount(${commonFilterDefs}) {
    assignmentCampaignsCount(${commonFilterValues})
  }
`;

const assignmentCampaignDetail = `
  query assignmentCampaignDetail($_id: String!) {
    assignmentCampaignDetail(_id: $_id) {
      ${assignmentCampaignFields}
    }
  }
`;

const segmentDetail = `
  query segmentDetail($_id: String) {
    segmentDetail(_id: $_id) {
      _id,
      name,
      color,
      count
    }
  }
`;
export default {
  assignmentCampaigns,
  assignmentCampaignsCount,
  assignmentCampaignDetail,
  segmentDetail
};
