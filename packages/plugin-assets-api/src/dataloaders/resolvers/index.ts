import customScalars from '@erxes/api-utils/src/customScalars';
import Asset from './asset';
import AssetCategory from './assetCategory';
import Movement from './movement';
import MovementItem from './movementItems';
import ItemSourceLocation from './itemSourceLocation';

import {
  Asset as assetMutations,
  AssetCategories as assetCategoriesMutations,
  Movement as movementMutations
} from './mutations';
import {
  Asset as assetQueries,
  AssetCategories as assetCategoriesQueries,
  Movement as movementQueries,
  MovementItem as movementItemQueries
} from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Asset,
  AssetCategory,
  ItemSourceLocation,
  MovementItem,
  Movement,
  Mutation: {
    ...assetCategoriesMutations,
    ...assetMutations,
    ...movementMutations
  },
  Query: {
    ...assetCategoriesQueries,
    ...assetQueries,
    ...movementQueries,
    ...movementItemQueries
  }
});

export default resolvers;
