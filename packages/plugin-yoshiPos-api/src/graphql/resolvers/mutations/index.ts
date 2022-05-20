import orders from './orders';
import posUsers from './posUsers';
import configs from './configs';
import payments from './payments';
import customers from './customers';
import users from './users';
import erxes from './erxesMutations';

export default {
  ...users,
  ...orders,
  ...posUsers,
  ...configs,
  ...payments,
  ...customers,
  ...erxes
};
