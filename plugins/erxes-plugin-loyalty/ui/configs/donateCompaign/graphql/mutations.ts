import { commonParamDefs, commonParams } from '../../commonTypes';
import { donateCompaignFields } from './queries';

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

const donateCompaignsAdd = `
  mutation donateCompaignsAdd(${paramDefs}) {
    donateCompaignsAdd(${params}) {
      ${donateCompaignFields}
    }
  }
`;

const donateCompaignsEdit = `
  mutation donateCompaignsEdit($_id: String!, ${paramDefs}) {
    donateCompaignsEdit(_id: $_id, ${params}) {
      ${donateCompaignFields}
    }
  }
`;

const donateCompaignsRemove = `
  mutation donateCompaignsRemove($_ids: [String]) {
    donateCompaignsRemove(_ids: $_ids)
  }
`;


export default {
  donateCompaignsAdd,
  donateCompaignsEdit,
  donateCompaignsRemove,
};
