const scripts = `
  query scripts($page: Int, $perPage: Int) {
    scripts(page: $page, perPage: $perPage) {
      _id
      name
      messengerId
      messenger {
        _id
        name
      }
      leadIds
      leads {
        _id
        name
      }
      kbTopicId
      kbTopic {
        _id
        title
      }
    }
  }
`;

const totalScriptsCount = `
  query totalScriptsCount {
    scriptsTotalCount
  }
`;

export default {
  scripts,
  totalScriptsCount
};
