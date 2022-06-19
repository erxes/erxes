import Order from './orders';
import Payment from './payments';
import Configs from './configs';
import PosUser from './posUsers';
import Logs from './logs';
import Product from './products';
import Report from './report';

export default {
  ...Order,
  ...Payment,
  ...Configs,
  ...PosUser,
  ...Logs,
  ...Product,
  ...Report
};
