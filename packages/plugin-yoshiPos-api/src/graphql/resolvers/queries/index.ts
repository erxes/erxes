import user from './user';
import logs from './logs';
import erxes from './erxesQueries';
import orders from './orders';
import products from './products';
import posUsers from './posUsers';
import configs from './configs';
import customers from './customers';
import payments from './payments';
import report from './report';

export default {
  ...user,
  ...logs,
  ...erxes,
  ...orders,
  ...products,
  ...posUsers,
  ...configs,
  ...customers,
  ...payments,
  ...report
};
