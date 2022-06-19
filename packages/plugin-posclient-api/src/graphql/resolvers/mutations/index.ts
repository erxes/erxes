import Order from './orders';
import Payment from './payments';
import Configs from './configs';
import PosUser from './posUsers';
import ErxesMutation from './erxesMutations';

export default {
  ...Order,
  ...Payment,
  ...Configs,
  ...PosUser,
  ...ErxesMutation
};
