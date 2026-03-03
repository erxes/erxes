import Order from './orders';
import Configs from './configs';
import PosUser from './posUsers';
import Product from './products';
import CpProduct from './cpProducts';
import Report from './report';
import Bridges from './bridges';
import Cover from './covers';

export default {
  ...Order,
  ...Configs,
  ...PosUser,
  ...Product,
  ...CpProduct,
  ...Report,
  ...Bridges,
  ...Cover,
};
