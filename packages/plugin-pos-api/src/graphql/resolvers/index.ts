import Mutation from './mutations';

import Query from './queries';

import Pos from './pos';
import PosOrder from './posOrder';
import PosOrderDetail from './posOrderDetail';
import PosProduct from './posProduct';
import PosCover from './posCover';
import customScalars from '@erxes/api-utils/src/customScalars';
import PosOrdersByCustomer from './posOrdersByCustomer';
import PosOrdersBySubs from './posOrdersBySubs';

const resolvers: any = async () => ({
  ...customScalars,

  Pos,
  PosOrder,
  PosProduct,
  PosOrderDetail,
  PosCover,
  PosOrdersByCustomer,
  PosOrdersBySubs,
  Mutation,
  Query
});

export default resolvers;
