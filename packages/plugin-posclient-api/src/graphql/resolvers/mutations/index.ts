import Order from './orders';
import Payment from './payments';
import Configs from './configs';
import Customers from './customers';
import PosUser from './posUsers';
import User from './users';
import ErxesMutation from './erxesMutations';

export default {
  ...Order,
  ...Payment,
  ...Configs,
  ...Customers,
  ...PosUser,
  ...User,
  ...ErxesMutation
};
