import { commonParamDefs, commonParams } from '../../commonTypes';
import { donateCampaignFields } from './queries';

const paramDefs = `
  ${commonParamDefs}
  $maxScore: Float,
  $awards: JSON
`;

const params = `
  ${commonParams}
  maxScore: $maxScore
  awards: $awards
`;

const donateCampaignsAdd = `
  mutation donateCampaignsAdd(${paramDefs}) {
    donateCampaignsAdd(${params}) {
      ${donateCampaignFields}
    }
  }
`;

const donateCampaignsEdit = `
  mutation donateCampaignsEdit($_id: String!, ${paramDefs}) {
    donateCampaignsEdit(_id: $_id, ${params}) {
      ${donateCampaignFields}
    }
  }
`;

const donateCampaignsRemove = `
  mutation donateCampaignsRemove($_ids: [String]) {
    donateCampaignsRemove(_ids: $_ids)
  }
`;

export default {
  donateCampaignsAdd,
  donateCampaignsEdit,
  donateCampaignsRemove
};
