import knowledgeBaseMutations from './knowledgeBaseMutations';
import knowledgeBaseQueries from './knowledgeBaseQueries';
import customScalars from '@erxes/api-utils/src/customScalars';
import KnowledgeBaseTopic from './knowledgeBaseTopic';

const resolvers: any = {
  ...customScalars,
  KnowledgeBaseTopic,
  Mutation: {
    ...knowledgeBaseMutations,
  },
  Query: {
    ...knowledgeBaseQueries,
  },
};

export default resolvers;
