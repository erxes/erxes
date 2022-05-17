import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { Cars as Car, CarCategory, Participant } from './tumentech';

const resolvers: any = async () => ({
  ...customScalars,

  Car,
  CarCategory,
  Participant,

  Mutation,
  Query
});

export default resolvers;
