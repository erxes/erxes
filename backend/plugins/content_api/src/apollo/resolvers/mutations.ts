import knowledgeBaseMutations from '@/knowledgebase/graphql/resolvers/mutations';
import portalMutations from '@/portal/graphql/resolvers/mutations';

export const mutations = {
    ...knowledgeBaseMutations, 
    ...portalMutations,
};