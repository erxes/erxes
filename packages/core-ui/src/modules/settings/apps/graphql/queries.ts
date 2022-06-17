const appFields = `
  _id
  createdAt
  name
  userGroupId
  accessToken
  expireDate

  userGroupName
`;

const apps = `
  query apps {
    apps {
      ${appFields}
    }
  }
`;

const appsTotalCount = `
  query appsTotalCount {
    appsTotalCount
  }
`;

const appDetail = `
  query appDetail($_id: String) {
    appDetail(_id: $_id) {
      ${appFields}
    }
  }
`;

export default { apps, appsTotalCount, appDetail };
