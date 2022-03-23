import { commonParamDefs, commonParams } from '../../commonTypes';
import { spinCompaignFields } from './queries';

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

const spinCompaignsAdd = `
  mutation spinCompaignsAdd(${paramDefs}) {
    spinCompaignsAdd(${params}) {
      ${spinCompaignFields}
    }
  }
`;

const spinCompaignsEdit = `
  mutation spinCompaignsEdit($_id: String!, ${paramDefs}) {
    spinCompaignsEdit(_id: $_id, ${params}) {
      ${spinCompaignFields}
    }
  }
`;

const spinCompaignsRemove = `
  mutation spinCompaignsRemove($_ids: [String]) {
    spinCompaignsRemove(_ids: $_ids)
  }
`;


export default {
  spinCompaignsAdd,
  spinCompaignsEdit,
  spinCompaignsRemove,
};
