import customScalars from '@erxes/api-utils/src/customScalars';
import GoalMutations from './goalMutations';
import GoalQueries from './goalQueries';
import Goal from './goal';

const resolvers: any = {
  ...customScalars,
  Goal,
  Mutation: {
    ...GoalMutations
  },
  Query: {
    ...GoalQueries
  }
};

export default resolvers;
