import knowledgeBaseQueries from '@/knowledgebase/graphql/resolvers/queries';
import portalQueries from '@/portal/graphql/resolvers/queries';

export const queries = {
    ...knowledgeBaseQueries, 
    ...portalQueries,
};