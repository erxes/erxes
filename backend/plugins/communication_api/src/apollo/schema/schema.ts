import {
  messagingTypes,
  messagingQueryFields,
  messagingMutationFields,
} from '@/messaging/graphql';
import {
  messagingAdminTypes,
  messagingAdminQueryFields,
} from '@/messaging/admin';

export const types = `
  ${messagingTypes}
  ${messagingAdminTypes}
`;

export const queries = `
  ${messagingQueryFields}
  ${messagingAdminQueryFields}
`;

export const mutations = `
  ${messagingMutationFields}
`;
