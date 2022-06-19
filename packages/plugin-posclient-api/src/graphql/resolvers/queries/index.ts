import Order from './orders';
import Payment from './payments';
import Configs from './configs';
import PosUser from './posUsers';
import ErxesQuery from './erxesQueries';
import Logs from './logs';
import Product from './products';
import Report from './report';

export default {
  ...Order,
  ...Payment,
  ...Configs,
  ...PosUser,
  ...ErxesQuery,
  ...Logs,
  ...Product,
  ...Report
};
