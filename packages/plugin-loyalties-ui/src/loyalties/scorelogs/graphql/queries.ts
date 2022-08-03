import { commonParamsValue, commonParamsDef } from '../../common/graphq';
const commonFields = `
changeScore
createdAt
createdBy
description
owner
ownerId
ownerType
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

export default {
  getScoreLogs
};
