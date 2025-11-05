import carResolver from '~/modules/cars/graphql/resolvers/customResolvers/carResolver';
import categoryResolver from '~/modules/cars/graphql/resolvers/customResolvers/categoryResolver';

export const customResolvers = {
  Car: carResolver,
  categoryResolver,
};
