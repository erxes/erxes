import gql from 'graphql-tag';

const types = `
type VideoCallData {
  url: String
  name: String
  status: String
  recordingLinks: [String]
}
`;

const queries = `
  videoCallUsageStatus: JSON
`;

const mutations = `
  dailySaveVideoRecordingInfo(roomName:String!, recordingId: String! ): String
  dailyDeleteVideoChatRoom(name: String!): Boolean
  dailyCreateRoom(contentType:String!, contentTypeId:String!): VideoCallData
`;

const typeDefs = async () => {
  return gql`
  scalar JSON
  scalar Date

  ${types}

  extend type Query {
    ${queries}
  }

  extend type Mutation {
    ${mutations}
  }
  `;
};

export default typeDefs;
