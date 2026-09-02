import {
  mutations as EngageMutations,
  queries as EngageQueries,
  types as EngageTypes,
} from '@/broadcast/graphql/schemas/engage';
import {
  mutations as EmailTemplateMutations,
  queries as EmailTemplateQueries,
  types as EmailTemplateTypes,
} from '@/broadcast/graphql/schemas/emailTemplate';

export const types = `
    ${EngageTypes}
    ${EmailTemplateTypes}
`;

export const queries = `
    ${EngageQueries}
    ${EmailTemplateQueries}
`;

export const mutations = `
    ${EngageMutations}
    ${EmailTemplateMutations}
`;
