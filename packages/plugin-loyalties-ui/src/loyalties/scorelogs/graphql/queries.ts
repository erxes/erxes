import { commonParamsDef, commonParamsValue } from '../../common/graphq';

const commonFields = `
  ownerId
  ownerType
  owner
  scoreLogs {
    action
    changeScore
    description
    createdBy
    createdAt
    target
    type
    campaign {
      _id
      title
      createdAt
      fieldId
      add
      subtract
    }
    campaignId
  }
`;

const getScoreLogs = `
query scoreLogList(${commonParamsDef},$fromDate: String,$orderType:String, $order: String, $toDate: String){
  scoreLogList(${commonParamsValue},fromDate: $fromDate,orderType:$orderType, order: $order, toDate: $toDate){
    list{
      ${commonFields}
    }

    total
  }
}
`;

const getScoreLogStatistics = `
  query ScoreLogStatistics(${commonParamsDef},$fromDate: String,$orderType:String, $order: String, $toDate: String) {
    scoreLogStatistics(${commonParamsValue},fromDate: $fromDate,orderType:$orderType, order: $order, toDate: $toDate)
  }
`;

export default {
  getScoreLogs,
  getScoreLogStatistics,
};
