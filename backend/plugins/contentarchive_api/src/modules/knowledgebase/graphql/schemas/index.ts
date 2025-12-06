import {
    mutations as knowledgeBaseMutations,
    queries as knowledgeBaseQueries,
    types as knowledgeBaseTypes,
    inputs as knowledgeBaseInputs
} from './knowledgebase';

export const types = `
    ${knowledgeBaseTypes}
    ${knowledgeBaseInputs}
`;

export const queries = `
    ${knowledgeBaseQueries}
`;

export const mutations = `
    ${knowledgeBaseMutations}
`;
