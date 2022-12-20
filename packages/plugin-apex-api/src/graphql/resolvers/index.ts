import customScalars from '@erxes/api-utils/src/customScalars';
import ReportMutations from './reportMutations';
import ReportQueries from './reportQueries';

const resolvers: any = {
  ...customScalars,
  Mutation: {
    ...ReportMutations
  },
  Query: {
    ...ReportQueries
  }
};

export default resolvers;
