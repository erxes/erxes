import Pos from '@/pos/graphql/resolvers/customResolvers/pos';
import PosCover from '@/pos/graphql/resolvers/customResolvers/posCover';
import PosOrder from '@/pos/graphql/resolvers/customResolvers/posOrder';
import PosOrderDetail from '@/pos/graphql/resolvers/customResolvers/posOrderDetail';
import PosOrdersByCustomer from '@/pos/graphql/resolvers/customResolvers/posOrdersByCustomer';
import PosOrdersBySubs from '@/pos/graphql/resolvers/customResolvers/posOrdersBySubs';
import PosProduct from '@/pos/graphql/resolvers/customResolvers/posProduct';
import {
  pos as MutationsPos,
  order as MutationsOrder,
  cover as MutationsCover,
} from '@/pos/graphql/resolvers/mutations';
import {
  Pos as QueriesPos,
  PosCovers as QueriesPosCovers,
  PosOrders as QueriesPosOrders
} from '@/pos/graphql/resolvers/queries';

const resolvers: any = {
  Pos,
  PosOrder,
  PosProduct,
  PosOrderDetail,
  PosCover,
  PosOrdersByCustomer,
  PosOrdersBySubs,
  Mutation: {
    ...MutationsPos,
    ...MutationsOrder,
    ...MutationsCover,
  },
  Query: {
    ...QueriesPos,
    ...QueriesPosOrders,
    ...QueriesPosCovers,
  },
};

export default resolvers;
