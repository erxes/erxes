import customScalars from '@erxes/api-utils/src/customScalars';
import ReportMutations from './reportMutations';
import Queries from './queries';
import Report from './report';

const resolvers: any = {
  ...customScalars,
  ApexReport: Report,
  Mutation: {
    ...ReportMutations
  },
  Query: {
    ...Queries
  }
};

export default resolvers;
