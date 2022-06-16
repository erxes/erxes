import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { Cars as Car, CarCategory, Participant } from './tumentech';
import { Direction } from './directions';
import { Route } from './routes';
import { Trip } from './trips';

const resolvers: any = async () => ({
  ...customScalars,

  Car,
  CarCategory,
  Participant,
  Direction,
  Route,
  Trip,

  Mutation,
  Query
});

export default resolvers;
