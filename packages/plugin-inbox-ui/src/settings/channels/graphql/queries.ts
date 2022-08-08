import channelQueries from '@erxes/ui-settings/src/channels/graphql/queries';

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

const users = `
  query users {
    users {
      _id
      email
      isActive
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
  channels: channelQueries.channels,
  channelDetail,
  channelsCount,
  channelsGetLast,
  integrationsCount
};
