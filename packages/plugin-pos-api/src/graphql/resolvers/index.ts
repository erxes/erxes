import Mutation from './mutations';

import Query from './queries';

import Pos from './pos';
import PosOrder from './posOrder';
import PosOrderDetail from './posOrderDetail';
import PosProduct from './posProduct';
import customScalars from '@erxes/api-utils/src/customScalars';

const resolvers: any = async () => ({
  ...customScalars,

  Pos,
  PosOrder,
  PosProduct,
  PosOrderDetail,
  Mutation,
  Query
});

export default resolvers;
