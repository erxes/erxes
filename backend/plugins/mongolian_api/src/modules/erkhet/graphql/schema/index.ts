import { types as erkhetTypes} from '@/erkhet/graphql/schema/type';
import { queries as erkhetQueries } from '@/erkhet/graphql/schema/queries';
import { mutations as erkhetMutations } from '@/erkhet/graphql/schema/mutations'


export const types = `
  ${erkhetTypes}
`;

export const queries = `
  ${erkhetQueries}
`;

export const mutations = `
  ${erkhetMutations}
`;