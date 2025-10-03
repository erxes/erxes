import {
  mutations as elementMutations,
  queries as elementQueries,
  types as elementTypes,
} from './element';
import {
  mutations as itineraryMutations,
  queries as itineraryQueries,
  types as itineraryTypes,
} from './itinerary';
import {
  mutations as tourMutations,
  queries as tourQueries,
  types as tourTypes,
} from './tour';
import {
  mutations as branchMutations,
  queries as branchQueries,
  types as branchTypes,
} from './bmsbranch';

export const types = `
    ${elementTypes}
    ${itineraryTypes}
    ${tourTypes}
    ${branchTypes}
`;

export const queries = `
    ${elementQueries}
    ${itineraryQueries}
    ${tourQueries}
    ${branchQueries}
`;

export const mutations = `
    ${elementMutations}
    ${itineraryMutations}
    ${tourMutations}
    ${branchMutations}
`;
