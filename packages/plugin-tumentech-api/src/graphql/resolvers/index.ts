import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { Cars as Car, CarCategory, Participant } from './tumentech';
import { Direction } from './directions';
import { Route } from './routes';

const resolvers: any = async () => ({
  ...customScalars,

  Car,
  CarCategory,
  Participant,
  Direction,
  Route,

  Mutation,
  Query
});

export default resolvers;
