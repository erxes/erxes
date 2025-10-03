import Pos from '@/pos/graphql/resolvers/customResolvers/pos';
import PosCover from '@/pos/graphql/resolvers/customResolvers/posCover';
import PosOrder from '@/pos/graphql/resolvers/customResolvers/posOrder';
import PosOrderDetail from '@/pos/graphql/resolvers/customResolvers/posOrderDetail';
import PosOrdersByCustomer from '@/pos/graphql/resolvers/customResolvers/posOrdersByCustomer';
import PosOrdersBySubs from '@/pos/graphql/resolvers/customResolvers/posOrdersBySubs';
import PosProduct from '@/pos/graphql/resolvers/customResolvers/posProduct';

export default {
  Pos,
  PosOrder,
  PosProduct,
  PosOrderDetail,
  PosCover,
  PosOrdersByCustomer,
  PosOrdersBySubs,
};
