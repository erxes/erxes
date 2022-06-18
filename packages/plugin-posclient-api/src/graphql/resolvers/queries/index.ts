import Order from './orders';
import Payment from './payments';
import Configs from './configs';
import Customers from './customers';
import PosUser from './posUsers';
import ErxesQuery from './erxesQueries';
import Logs from './logs';
import Product from './products';
import Report from './report';
import User from './user';

export default {
  ...Order,
  ...Payment,
  ...Configs,
  ...Customers,
  ...PosUser,
  ...ErxesQuery,
  ...Logs,
  ...Product,
  ...Report,
  ...User
};
