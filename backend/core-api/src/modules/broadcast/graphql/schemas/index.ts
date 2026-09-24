import {
  dryRunTypes as EngageDryRunTypes,
  recipientEmailTypes as EngageRecipientEmailTypes,
  mutations as EngageMutations,
  queries as EngageQueries,
  types as EngageTypes,
} from '@/broadcast/graphql/schemas/engage';

export const types = `
    ${EngageTypes}
    ${EngageDryRunTypes}
    ${EngageRecipientEmailTypes}
`;

export const queries = `
    ${EngageQueries}
`;

export const mutations = `
    ${EngageMutations}
`;
