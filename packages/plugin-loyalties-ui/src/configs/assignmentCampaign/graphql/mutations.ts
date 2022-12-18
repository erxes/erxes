import { commonParamDefs, commonParams } from '../../commonTypes';
import { assignmentCampaignFields } from './queries';

const paramDefs = `
  ${commonParamDefs},
  $segmentIds: [String] 
  $voucherCampaignId: String
`;

const params = `
  ${commonParams},
  segmentIds: $segmentIds
  voucherCampaignId: $voucherCampaignId
`;

const assignmentCampaignsAdd = `
  mutation assignmentCampaignsAdd(${paramDefs}) {
    assignmentCampaignsAdd(${params}) {
      ${assignmentCampaignFields}
    }
  }
`;

const assignmentCampaignsEdit = `
  mutation assignmentCampaignsEdit($_id: String!, ${paramDefs}) {
    assignmentCampaignsEdit(_id: $_id, ${params}) {
      ${assignmentCampaignFields}
    }
  }
`;

const assignmentCampaignsRemove = `
  mutation assignmentCampaignsRemove($_ids: [String]) {
    assignmentCampaignsRemove(_ids: $_ids)
  }
`;

export default {
  assignmentCampaignsAdd,
  assignmentCampaignsEdit,
  assignmentCampaignsRemove
};
