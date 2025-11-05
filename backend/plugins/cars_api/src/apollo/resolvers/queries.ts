import { carQueries } from '~/modules/cars/graphql/resolvers/queries/carQueries';
import { CarCategoryQueries } from '~/modules/cars/graphql/resolvers/queries/categoryQueries';

export const queries = {
  ...carQueries,
  ...CarCategoryQueries,
};
