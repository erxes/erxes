import { commonParamDefs, commonParams } from '../../commonTypes';
import { assignmentCampaignFields } from './queries';

const paramDefs = `
  ${commonParamDefs},
  $fieldId: String,
  $allowMultiWin:Boolean,
  $segmentIds: [String] 
  $voucherCampaignId: String
`;

const params = `
  ${commonParams},
  fieldId: $fieldId,
  segmentIds: $segmentIds,
  allowMultiWin: $allowMultiWin
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
