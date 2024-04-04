import customScalars from '@erxes/api-utils/src/customScalars';
import Product from './product';
import ProductCategory from './productCategory';
import Uom from './uom';
import {
  ProductConfigs as MutationsProductConfig,
  Products as Mutations,
  Uoms as MutationsUom
} from './mutations';
import {
  ProductConfigs as QueriesProductConfig,
  Products as Queries,
  Uoms as QueriesUom
} from './queries';

const resolvers: any = {
  ...customScalars,
  Product,
  ProductCategory,
  Uom,
  Mutation: {
    ...Mutations,
    ...MutationsProductConfig,
    ...MutationsUom
  },
  Query: {
    ...Queries,
    ...QueriesProductConfig,
    ...QueriesUom
  }
};

export default resolvers;
