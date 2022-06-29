import customScalars from '@erxes/api-utils/src/customScalars';
import Product from './product';
import ProductCategory from './productCategory';

import {
  Products as Mutations,
  ProductConfigs as MutationsProductConfig,
  Uoms as MutationsUom
} from './mutations';

import {
  Products as Queries,
  ProductConfigs as QueriesProductConfig,
  Uoms as QueriesUom
} from './queries';

const resolvers: any = {
  ...customScalars,
  Product,
  ProductCategory,
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
