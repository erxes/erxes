const channelDetail = `
  query channelDetail($_id: String!) {
    channelDetail(_id: $_id) {
      _id
      name
      integrations {
        _id
        name
        kind
        brand {
          _id
          name
          code
        }
      }
      integrationIds
      memberIds
    }
  }
`;

const channels = `
  query channels($page: Int, $perPage: Int, $memberIds: [String]) {
    channels(page: $page, perPage: $perPage, memberIds: $memberIds) {
      _id
      name
      description
      integrationIds
      memberIds
      members {
        _id
        email
        details {
          avatar
          fullName
        }
      }
    }
  }
`;

const users = `
  query users {
    users {
      _id
      email
      details {
        avatar
        fullName
      }
    }
  }
`;

const channelsCount = `
  query totalChannelsCount {
    channelsTotalCount
  }
`;

const integrationsCount = `
  query totalIntegrationsCount {
    integrationsTotalCount {
      byChannel
    }
  }
`;

const channelsGetLast = `
  query channelsGetLast {
    channelsGetLast {
      _id
    }
  }
`;

export default {
  users,
  channels,
  channelDetail,
  channelsCount,
  channelsGetLast,
  integrationsCount
};
