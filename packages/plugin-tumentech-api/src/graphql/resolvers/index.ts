import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { Cars as Car, CarCategory, Participant } from './tumentech';
import { Direction } from './directions';
import { Route } from './routes';
import { Trip } from './trips';
import { DealPlace } from './dealPlace';

const resolvers: any = async () => ({
  ...customScalars,

  Car,
  CarCategory,
  Participant,
  Direction,
  Route,
  Trip,
  DealPlace,

  Mutation,
  Query
});

export default resolvers;
