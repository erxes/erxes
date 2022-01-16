import { commonParamDefs, commonParams } from '../../commonTypes';
import { lotteryCompaignFields } from './queries';

const paramDefs = `
  ${commonParamDefs}
  $lotteryDate: Date,
  $numberFormat: String,
  $buyScore: Float,
  $awards: JSON
`;

const params = `
  ${commonParams}
  lotteryDate: $lotteryDate,
  numberFormat: $numberFormat,
  buyScore: $buyScore,
  awards: $awards,
`;

const lotteryCompaignsAdd = `
  mutation lotteryCompaignsAdd(${paramDefs}) {
    lotteryCompaignsAdd(${params}) {
      ${lotteryCompaignFields}
    }
  }
`;

const lotteryCompaignsEdit = `
  mutation lotteryCompaignsEdit($_id: String!, ${paramDefs}) {
    lotteryCompaignsEdit(_id: $_id, ${params}) {
      ${lotteryCompaignFields}
    }
  }
`;

const lotteryCompaignsRemove = `
  mutation lotteryCompaignsRemove($_ids: [String]) {
    lotteryCompaignsRemove(_ids: $_ids)
  }
`;


export default {
  lotteryCompaignsAdd,
  lotteryCompaignsEdit,
  lotteryCompaignsRemove,
};
