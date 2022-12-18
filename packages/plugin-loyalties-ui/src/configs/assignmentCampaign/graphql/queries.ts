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
  segmentIds
  voucherCampaignId
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

const segmentsDetail = `
  query segmentsDetail($_ids: [String]) {
    segmentsDetail(_ids: $_ids) {
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
  segmentsDetail
};
