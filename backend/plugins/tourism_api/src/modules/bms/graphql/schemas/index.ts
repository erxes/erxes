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
  inputs as customTourInputs,
  mutations as customTourMutations,
  queries as customTourQueries,
  types as customTourTypes,
} from './customTourType';
import {
  mutations as branchMutations,
  queries as branchQueries,
  types as branchTypes,
} from './bmsbranch';

export const types = `
    ${elementTypes}
    ${itineraryTypes}
    ${customTourTypes}
    ${tourTypes}
    ${branchTypes}
    ${customTourInputs}
`;

export const queries = `
    ${elementQueries}
    ${itineraryQueries}
    ${customTourQueries}
    ${tourQueries}
    ${branchQueries}
`;

export const mutations = `
    ${elementMutations}
    ${itineraryMutations}
    ${customTourMutations}
    ${tourMutations}
    ${branchMutations}
`;
