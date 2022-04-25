const apps = `
  query apps {
    apps {
      _id
      createdAt
      name
      userGroupId

      userGroupName
    }
  }
`;

const appsTotalCount = `
  query appsTotalCount {
    appsTotalCount
  }
`;

export default { apps, appsTotalCount }
