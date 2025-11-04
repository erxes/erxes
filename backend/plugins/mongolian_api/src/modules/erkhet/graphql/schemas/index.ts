import { mutations as erkhetMutations } from '~/modules/erkhet/graphql/schemas/mutations';
import { queries as erkhetQueries } from '~/modules/erkhet/graphql/schemas/queries';
import { types as erkhetTypes } from '~/modules/erkhet/graphql/schemas/type';

export const types = `
  ${erkhetTypes}
`;

export const queries = `
  ${erkhetQueries}
`;

export const mutations = `
  ${erkhetMutations}
`;
