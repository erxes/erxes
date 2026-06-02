import {
  mutations as CategoryMutations,
  queries as CategoryQueries,
  types as CategoryTypes,
} from './category';

import {
  mutations as ProductMutations,
  queries as ProductQueries,
  types as ProductTypes,
} from './product';

import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes,
} from './config';

import {
  mutations as UomMutations,
  queries as UomQueries,
  types as UomTypes,
} from './uom';

import {
  mutations as RuleMutations,
  queries as RuleQueries,
  types as RuleTypes,
} from './rule';

import {
  mutations as PackageMutations,
  queries as PackageQueries,
  types as PackageTypes,
} from './package';

export const types = `
  ${CategoryTypes}
  ${ProductTypes}
  ${ConfigTypes}
  ${UomTypes}
  ${RuleTypes}
  ${PackageTypes}
`;

export const queries = `
  ${CategoryQueries}
  ${ProductQueries}
  ${ConfigQueries}
  ${UomQueries}
  ${RuleQueries}
  ${PackageQueries}
`;

export const mutations = `
  ${CategoryMutations}
  ${ProductMutations}
  ${ConfigMutations}
  ${UomMutations}
  ${RuleMutations}
  ${PackageMutations}
`;
