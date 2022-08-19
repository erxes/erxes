import { commonParamDefs, commonParams } from '../../commonTypes';
import { lotteryCampaignFields } from './queries';

const paramDefs = `
  ${commonParamDefs}
  $numberFormat: String,
  $buyScore: Float,
  $awards: JSON
`;

const params = `
  ${commonParams}
  numberFormat: $numberFormat,
  buyScore: $buyScore,
  awards: $awards,
`;

const lotteryCampaignsAdd = `
  mutation lotteryCampaignsAdd(${paramDefs}) {
    lotteryCampaignsAdd(${params}) {
      ${lotteryCampaignFields}
    }
  }
`;

const lotteryCampaignsEdit = `
  mutation lotteryCampaignsEdit($_id: String!, ${paramDefs}) {
    lotteryCampaignsEdit(_id: $_id, ${params}) {
      ${lotteryCampaignFields}
    }
  }
`;

const lotteryCampaignsRemove = `
  mutation lotteryCampaignsRemove($_ids: [String]) {
    lotteryCampaignsRemove(_ids: $_ids)
  }
`;

export default {
  lotteryCampaignsAdd,
  lotteryCampaignsEdit,
  lotteryCampaignsRemove
};
