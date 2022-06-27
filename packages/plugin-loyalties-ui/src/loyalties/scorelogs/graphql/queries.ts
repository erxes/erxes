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
query scoreLogList($fromDate: String,$orderType:String, $order: String, $ownerType: String, $toDate: String){
  scoreLogList(fromDate: $fromDate,orderType:$orderType, order: $order, ownerType: $ownerType, toDate: $toDate){
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
