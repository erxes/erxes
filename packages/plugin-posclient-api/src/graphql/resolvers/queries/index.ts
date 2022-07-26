import Order from './orders';
import Payment from './payments';
import Configs from './configs';
import PosUser from './posUsers';
import Product from './products';
import Report from './report';
import Bridges from './bridges';

export default {
  ...Order,
  ...Payment,
  ...Configs,
  ...PosUser,
  ...Product,
  ...Report,
  ...Bridges
};
