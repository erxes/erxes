import Order from './orders';
import Payment from './payments';
import Configs from './configs';
import PosUser from './posUsers';

export default {
  ...Order,
  ...Payment,
  ...Configs,
  ...PosUser
};
