import Car from './cars';

import {
  Cars as CarMutations,
} from './mutations';

import {
  Cars as CarQueries,
} from './queries';

const resolvers: any = async () => (
  
  {
  Car,
  Mutation: {
    ...CarMutations,
  },
  Query: {
    ...CarQueries,
  }
});

export default resolvers;
