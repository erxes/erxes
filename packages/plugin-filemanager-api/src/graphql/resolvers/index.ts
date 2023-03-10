import customScalars from '@erxes/api-utils/src/customScalars';
import Mutations from './mutations';
import Queries from './queries';
import { folder, file, log } from './filemanager';

const resolvers: any = {
  ...customScalars,
  FileManagerFolder: folder,
  FileManagerFile: file,
  FileManagerLog: log,
  Mutation: {
    ...Mutations
  },
  Query: {
    ...Queries
  }
};

export default resolvers;
