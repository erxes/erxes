import customScalars from '@erxes/api-utils/src/customScalars';
import Mutations from './mutations';
import Queries from './queries';
import Report from './report';
import Story from './story';

const resolvers: any = {
  ...customScalars,
  ApexReport: Report,
  ApexStory: Story,
  Mutation: {
    ...Mutations
  },
  Query: {
    ...Queries
  }
};

export default resolvers;
