import customScalars from '@erxes/api-utils/src/customScalars';

import { DealRoute } from './dealRoute';
import { DealPlace } from './dealPlace';
import { Direction } from './directions';
import Mutation from './mutations';
import Query from './queries';
import { Route } from './routes';
import { Trip } from './trips';
import { CustomerAccount } from './accounts';
import { DriverGroup } from './driverGroup';
import { CarCategory, Cars as Car, Participant, Topup } from './tumentech';
import { TumentechDeal } from './tumentechDeal';

const resolvers: any = async () => ({
  ...customScalars,

  Car,
  CarCategory,
  Participant,
  Direction,
  Route,
  Trip,
  DealRoute,
  DealPlace,
  Topup,
  CustomerAccount,
  DriverGroup,
  TumentechDeal,

  Mutation,
  Query
});

export default resolvers;
