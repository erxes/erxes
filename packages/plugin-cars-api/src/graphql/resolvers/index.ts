import Car from './cars';
import CarCategory from './carCategories';

import { Cars as CarMutations } from './mutations';

import { Cars as CarQueries } from './queries';

const resolvers: any = async () => ({
  CarCategory,
  Car,
  Mutation: {
    ...CarMutations
  },
  Query: {
    ...CarQueries
  }
});

export default resolvers;
