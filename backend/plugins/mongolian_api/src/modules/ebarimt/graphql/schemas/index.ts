import {
    mutations as ebarimtMutations,
    queries as ebarimtQueries,
    types as ebarimtTypes
} from './ebarimt';
import {
    mutations as productGroupMutations,
    queries as productGroupQueries,
    types as productGroupTypes
} from './productGroup';
import {
    mutations as productRuleMutations,
    queries as productRuleQueries,
    types as productRuleTypes
} from './productRule';

export const types = `
    ${ebarimtTypes}
    ${productGroupTypes}
    ${productRuleTypes}
`;

export const queries = `
    ${ebarimtQueries}
    ${productGroupQueries}
    ${productRuleQueries}
`;

export const mutations = `
    ${ebarimtMutations}
    ${productGroupMutations}
    ${productRuleMutations}
`;
