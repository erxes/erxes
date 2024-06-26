import customScalars from '@erxes/api-utils/src/customScalars';
import customResolvers from './customResolvers';

import {
  Asset as assetMutations,
  AssetCategories as assetCategoriesMutations,
  Movement as movementMutations
} from './mutations';
import {
  Asset as assetQueries,
  AssetCategories as assetCategoriesQueries,
  Movement as movementQueries,
  MovementItem as movementItemQueries,
  KbArticlesHistoriesQueries
} from './queries';

const resolvers: any = async () => ({
  ...customScalars,
  ...customResolvers,
  Mutation: {
    ...assetCategoriesMutations,
    ...assetMutations,
    ...movementMutations
  },
  Query: {
    ...assetCategoriesQueries,
    ...assetQueries,
    ...movementQueries,
    ...movementItemQueries,
    ...KbArticlesHistoriesQueries
  }
});

export default resolvers;
