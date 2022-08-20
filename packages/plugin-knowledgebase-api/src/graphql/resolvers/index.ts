import knowledgeBaseMutations from './knowledgeBaseMutations';
import knowledgeBaseQueries from './knowledgeBaseQueries';
import customScalars from '@erxes/api-utils/src/customScalars';
import KnowledgeBaseTopic from './knowledgeBaseTopic';
import KnowledgeBaseArticle from './knowledgeBaseArticle';
import {
  KnowledgeBaseCategory,
  KnowledgeBaseParentCategory,
} from './knowledgeBaseCategory';

const resolvers: any = {
  ...customScalars,
  KnowledgeBaseTopic,
  KnowledgeBaseCategory,
  KnowledgeBaseParentCategory,
  KnowledgeBaseArticle,
  Mutation: {
    ...knowledgeBaseMutations,
  },
  Query: {
    ...knowledgeBaseQueries,
  },
};

export default resolvers;
