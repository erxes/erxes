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
query scoreLogList{
  scoreLogList{
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
