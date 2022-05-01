import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { Cars as Car, CarCategory } from './tumentech';

const resolvers: any = async () => ({
  ...customScalars,

  Car,
  CarCategory,

  Mutation,
  Query
});

export default resolvers;
