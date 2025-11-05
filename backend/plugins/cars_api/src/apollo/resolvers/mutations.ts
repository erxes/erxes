import { carMutations } from '~/modules/cars/graphql/resolvers/mutations/carMutations';
import { carCategoryMutations } from '~/modules/cars/graphql/resolvers/mutations/categoryMutations';

export const mutations = {
  ...carMutations,
  ...carCategoryMutations,
};
