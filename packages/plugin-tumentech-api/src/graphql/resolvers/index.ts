import customScalars from '@erxes/api-utils/src/customScalars';

import { DealRoute } from './dealRoute';
import { Direction } from './directions';
import Mutation from './mutations';
import Query from './queries';
import { Route } from './routes';
import { Trip } from './trips';
import { CarCategory, Cars as Car, Participant } from './tumentech';

const resolvers: any = async () => ({
  ...customScalars,

  Car,
  CarCategory,
  Participant,
  Direction,
  Route,
  Trip,
  DealRoute,

  Mutation,
  Query
});

export default resolvers;
