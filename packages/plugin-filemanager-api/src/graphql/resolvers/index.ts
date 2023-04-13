import customScalars from '@erxes/api-utils/src/customScalars';
import Mutations from './mutations';
import Queries from './queries';
import {
  folder,
  file,
  log,
  accessRequest,
  ackRequest,
  relation
} from './filemanager';

const resolvers: any = {
  ...customScalars,
  FileManagerFolder: folder,
  FileManagerFile: file,
  FileManagerLog: log,
  FileManagerAccessRequest: accessRequest,
  FileManagerAckRequest: ackRequest,
  FileManagerRelation: relation,
  Mutation: {
    ...Mutations
  },
  Query: {
    ...Queries
  }
};

export default resolvers;
