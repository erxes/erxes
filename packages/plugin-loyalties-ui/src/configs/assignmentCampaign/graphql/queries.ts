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

const segments = `
  query segments($contentTypes: [String]!, $ids: [String]) {
    segments(contentTypes: $contentTypes, ids: $ids) {
      _id
      name
      color
    }
  }
`;

export default {
  assignmentCampaigns,
  assignmentCampaignsCount,
  assignmentCampaignDetail,
  segments
};
