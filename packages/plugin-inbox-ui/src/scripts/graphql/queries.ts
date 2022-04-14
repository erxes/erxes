
import { isEnabled } from '@erxes/ui/src/utils/core';

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
      ${
        isEnabled('knowledgebase')
          ? `
      kbTopic {
        _id
        title
      }
      `
          : ''
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
