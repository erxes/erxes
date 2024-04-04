import { commonDefs, commonVariables } from '../../common/graphq';
import { lotteryFields } from './queries';

const lotteriesAdd = `
  mutation lotteriesAdd(${commonDefs}, $status: String) {
    lotteriesAdd(${commonVariables}, status: $status) {
      ${lotteryFields}
    }
  }
`;

const lotteriesEdit = `
  mutation lotteriesEdit($_id: String!, ${commonDefs}, $status: String) {
    lotteriesEdit(_id: $_id, ${commonVariables}, status: $status) {
      ${lotteryFields}
    }
  }
`;

const lotteriesRemove = `
  mutation lotteriesRemove($_ids: [String]) {
    lotteriesRemove(_ids: $_ids)
  }
`;

const doLotteries = `
mutation doLottery($awardId:String,$campaignId:String){
  doLottery(awardId:$awardId,campaignId:$campaignId)
}
`;
const multipledoLottery = `
mutation doLotteryMultiple($awardId:String,$campaignId: String,$multiple: Int){
  doLotteryMultiple(awardId:$awardId,campaignId:$campaignId,multiple:$multiple)
}
`;

const getNextChar = `
mutation getNextChar($awardId:String,$campaignId:String,$prevChars:String){
  getNextChar(awardId:$awardId,campaignId:$campaignId,prevChars:$prevChars)
}
`;

export default {
  lotteriesAdd,
  lotteriesEdit,
  lotteriesRemove,
  doLotteries,
  getNextChar,
  multipledoLottery
};
