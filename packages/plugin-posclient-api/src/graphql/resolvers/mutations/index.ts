import Order from './orders';
import Configs from './configs';
import PosUser from './posUsers';
import Cover from './covers';

export default {
  ...Order,
  ...Configs,
  ...PosUser,
  ...Cover
};
