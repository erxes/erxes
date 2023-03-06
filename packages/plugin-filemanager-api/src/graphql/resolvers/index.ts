import customScalars from '@erxes/api-utils/src/customScalars';
import Mutations from './mutations';
import Queries from './queries';
import { folder } from './filemanager';

const resolvers: any = {
  ...customScalars,
  FileManagerFolder: folder,
  Mutation: {
    ...Mutations
  },
  Query: {
    ...Queries
  }
};

export default resolvers;
