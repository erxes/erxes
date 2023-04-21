import Order from './orders';
import Configs from './configs';
import PosUser from './posUsers';
import Product from './products';
import Report from './report';
import Bridges from './bridges';
import Cover from './covers';

export default {
  ...Order,
  ...Configs,
  ...PosUser,
  ...Product,
  ...Report,
  ...Bridges,
  ...Cover
};
