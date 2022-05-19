import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { SalesLog } from './customResolvers/salesplans';
const resolvers: any = async () => ({
  ...customScalars,
  Mutation,
  Query,
  SalesLog
});

export default resolvers;
