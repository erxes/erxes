import Order from './orders';
import Configs from './configs';
import PosUser from './posUsers';

export default {
  ...Order,
  ...Configs,
  ...PosUser
};
