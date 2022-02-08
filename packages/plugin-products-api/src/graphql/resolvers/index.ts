import customScalars from '@erxes/api-utils/src/customScalars';
import Product from './product';
import ProductCategory from './productCategory';

import {
  Products as Mutations,
} from './mutations';

import {
  Products as Queries,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Product,
  ProductCategory,
  Mutation: {
    ...Mutations,
  },
  Query: {
    ...Queries,
  }
};

export default resolvers;