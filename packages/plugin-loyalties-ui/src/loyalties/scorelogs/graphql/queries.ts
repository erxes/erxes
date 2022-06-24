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
query scoreLogList($fromDate: String, $order: String, $ownerType: String, $toDate: String){
  scoreLogList(fromDate: $fromDate, order: $order, ownerType: $ownerType, toDate: $toDate){
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
