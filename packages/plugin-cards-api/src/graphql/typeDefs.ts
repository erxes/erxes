import { gql } from 'apollo-server-express';
import {
  types as boardTypes,
  queries as boardQueries,
  mutations as boardMutations
} from './schema/board';
import {
  types as dealTypes,
  queries as dealQueries,
  mutations as dealMutations
} from './schema/deal';
import {
  types as taskTypes,
  queries as taskQueries,
  mutations as taskMutations
} from './schema/task';
import {
  types as ticketTypes,
  queries as ticketQueries,
  mutations as ticketMutations
} from './schema/ticket';
import {
  types as growthHackTypes,
  queries as growthHackQueries,
  mutations as growthHackMutations
} from './schema/growthHack';
import {
  types as plTypes,
  queries as plQueries,
  mutations as plMutations
} from './schema/pipelineLabel';
import {
  types as ptTypes,
  queries as ptQueries,
  mutations as ptMutations
} from './schema/pipelineTemplate';
import { types as CommonTypes } from './schema/common';

const typeDefs = gql`
  scalar JSON
  scalar Date
  
  ${boardTypes}
  ${dealTypes}
  ${taskTypes}
  ${ticketTypes}
  ${growthHackTypes}
  ${plTypes}
  ${ptTypes}
  ${CommonTypes}
  
  extend type Query {
    ${boardQueries}
    ${dealQueries}
    ${taskQueries}
    ${ticketQueries}
    ${growthHackQueries}
    ${plQueries}
    ${ptQueries}
  }
  
  extend type Mutation {
    ${boardMutations}
    ${dealMutations}
    ${taskMutations}
    ${ticketMutations}
    ${growthHackMutations}
    ${plMutations}
    ${ptMutations}
  }
`;

export default typeDefs;
