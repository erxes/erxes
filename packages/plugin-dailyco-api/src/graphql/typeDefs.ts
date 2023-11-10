import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

const types: string = `
type VideoCallData {
  url: String
  name: String
  status: String
  recordingLinks: [String]
}
`;

const queries: string = `
  videoCallUsageStatus: JSON
`;

const mutations: string = `
  dailySaveVideoRecordingInfo(roomName:String!, recordingId: String! ): String
  dailyDeleteVideoChatRoom(name: String!): Boolean
  dailyCreateRoom(contentType:String!, contentTypeId:String!): VideoCallData
`;

const typeDefs: DocumentNode = gql`
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

export default typeDefs;
