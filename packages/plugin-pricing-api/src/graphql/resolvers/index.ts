import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { Discount } from './customResolvers/discount';

const resolvers: any = {
  ...customScalars,
  Discount,
  Mutation,
  Query
};

export default resolvers;
