import customScalars from '@erxes/api-utils/src/customScalars';
import golomtConfigs from './mutations/configMutation';
//import queries from './queries/enquiryQueries';

const resolvers: any = {
  ...customScalars,
  Mutation: {
    ...golomtConfigs
  },
  // Query: {
  //   ...queries
  // }
};

export default resolvers;
