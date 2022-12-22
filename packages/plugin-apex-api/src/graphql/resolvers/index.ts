import customScalars from '@erxes/api-utils/src/customScalars';
import ReportMutations from './reportMutations';
import ReportQueries from './reportQueries';
import Report from './report';

const resolvers: any = {
  ...customScalars,
  ApexReport: Report,
  Mutation: {
    ...ReportMutations
  },
  Query: {
    ...ReportQueries
  }
};

export default resolvers;
