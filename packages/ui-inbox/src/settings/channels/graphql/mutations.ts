const commonParamsDef = `
  $name: String!,
  $description: String,
  $memberIds: [String],
  $integrationIds: [String]
`;

const commonParams = `
  name: $name,
  description: $description,
  memberIds: $memberIds,
  integrationIds: $integrationIds
`;

const channelAdd = `
  mutation channelsAdd(${commonParamsDef}) {
    channelsAdd(${commonParams}) {
      _id
    }
  }
`;

const channelEdit = `
  mutation channelsEdit($_id: String!, ${commonParamsDef}) {
    channelsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const channelRemove = `
  mutation channelsRemove($_id: String!) {
    channelsRemove(_id: $_id)
  }
`;

export default {
  channelAdd,
  channelEdit,
  channelRemove
};
