import { commonParamDefs, commonParams } from '../../commonTypes';
import { spinCampaignFields } from './queries';

const paramDefs = `
  ${commonParamDefs}
  $buyScore: Float,
  $awards: JSON
`;

const params = `
  ${commonParams}
  buyScore: $buyScore,
  awards: $awards,
`;

const spinCampaignsAdd = `
  mutation spinCampaignsAdd(${paramDefs}) {
    spinCampaignsAdd(${params}) {
      ${spinCampaignFields}
    }
  }
`;

const spinCampaignsEdit = `
  mutation spinCampaignsEdit($_id: String!, ${paramDefs}) {
    spinCampaignsEdit(_id: $_id, ${params}) {
      ${spinCampaignFields}
    }
  }
`;

const spinCampaignsRemove = `
  mutation spinCampaignsRemove($_ids: [String]) {
    spinCampaignsRemove(_ids: $_ids)
  }
`;

export default {
  spinCampaignsAdd,
  spinCampaignsEdit,
  spinCampaignsRemove
};
