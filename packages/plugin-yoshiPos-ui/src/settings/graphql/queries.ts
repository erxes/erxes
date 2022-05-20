const commonUser = `
  _id
  createdAt
  username
  email
  isOwner

  details {
    avatar
    fullName
    shortName
    position
    description
    operatorPhone
  }
`;

const posUsers = `
  query posUsers($searchValue: String) {
    posUsers(searchValue: $searchValue) {
      ${commonUser}
    }
  }
`;

const dailyReport = `
  query dailyReport($posUserIds: [String], $posNumber: String) {
    dailyReport(posUserIds: $posUserIds, posNumber: $posNumber) {
      report
    }
  }
`;

export default {
  posUsers,
  dailyReport
};
