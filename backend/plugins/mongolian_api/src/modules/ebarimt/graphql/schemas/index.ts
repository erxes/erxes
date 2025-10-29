import { types as ebarimtTypes } from './ebarimt';
import { types as productGroupTypes } from './productGroup';
import { types as productRuleTypes } from './productRule';

import { queries as ebarimtQueries } from './ebarimt';
import { queries as productGroupQueries } from './productGroup';
import { queries as productRuleQueries } from './productRule';

import { mutations as ebarimtMutations } from './ebarimt';
import { mutations as productGroupMutations } from './productGroup';
import { mutations as productRuleMutations } from './productRule';

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
