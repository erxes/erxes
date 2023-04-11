import customScalars from '@erxes/api-utils/src/customScalars';
import Mutations from './mutations';
import Queries from './queries';
import { folder, file, log, accessRequest, ackRequest } from './filemanager';

const resolvers: any = {
  ...customScalars,
  FileManagerFolder: folder,
  FileManagerFile: file,
  FileManagerLog: log,
  FileManagerAccessRequest: accessRequest,
  FileManagerAckRequest: ackRequest,
  Mutation: {
    ...Mutations
  },
  Query: {
    ...Queries
  }
};

export default resolvers;
