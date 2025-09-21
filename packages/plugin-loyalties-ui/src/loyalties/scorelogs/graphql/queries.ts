import { commonParamsDef, commonParamsValue } from "../../common/graphq";

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
  totalScore
`;

const getScoreLogs = `
query scoreLogList(${commonParamsDef},$fromDate: String,$orderType:String, $order: String, $toDate: String, $stageId: String, $number: String, $action: String){
  scoreLogList(${commonParamsValue},fromDate: $fromDate,orderType:$orderType, order: $order, toDate: $toDate, stageId: $stageId, number: $number, action: $action){
    list{
      ${commonFields}
    }

    total
  }
}
`;

const getScoreLogStatistics = `
  query ScoreLogStatistics(${commonParamsDef},$fromDate: String,$orderType:String, $order: String, $toDate: String, $stageId: String, $number: String, $action: String) {
    scoreLogStatistics(${commonParamsValue},fromDate: $fromDate,orderType:$orderType, order: $order, toDate: $toDate, stageId: $stageId, number: $number, action: $action)
  }
`;

export default {
  getScoreLogs,
  getScoreLogStatistics,
};
