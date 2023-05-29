import { gql } from 'apollo-server-express';
import {
  types as checkListTypes,
  queries as checkListQueries,
  mutations as checkListMutations
} from './schema/checklist';
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
  types as purchaseTypes,
  queries as purchaseQueries,
  mutations as purchaseMutations
} from './schema/purchase';
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

const typeDefs = async serviceDiscovery => {
  const contactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const tagsEnabled = await serviceDiscovery.isEnabled('tags');
  const formsEnabled = await serviceDiscovery.isEnabled('forms');

  const isEnabled = {
    contacts: contactsEnabled,
    forms: formsEnabled,
    tags: tagsEnabled
  };

  return gql`
    scalar JSON
    scalar Date

    extend type User @key(fields: "_id") {
      _id: String! @external
    }
  
    extend type Branch @key(fields: "_id") {
          _id: String! @external
    }

    extend type Department @key(fields: "_id") {
          _id: String! @external
    }

    ${
      contactsEnabled
        ? `
        extend type Company @key(fields: "_id") {
          _id: String! @external
        }
  
        extend type Customer @key(fields: "_id") {
          _id: String! @external
        }
      `
        : ''
    }

    ${
      tagsEnabled
        ? `
        extend type Tag @key(fields: "_id") {
          _id: String! @external
        }
      `
        : ''
    }
    
    ${boardTypes(isEnabled)}
    ${dealTypes(isEnabled)}
    ${purchaseTypes(isEnabled)}
    ${taskTypes(isEnabled)}
    ${ticketTypes(isEnabled)}

    ${formsEnabled ? growthHackTypes : ''}

    ${plTypes}
    ${ptTypes}
    ${CommonTypes}
    ${checkListTypes}
    
    extend type Query {
      ${boardQueries}
      ${dealQueries}
      ${purchaseQueries}
      ${taskQueries}
      ${ticketQueries}

      ${formsEnabled ? growthHackQueries : ''}

      ${plQueries}
      ${ptQueries}
      ${checkListQueries}
    }
    
    extend type Mutation {
      ${boardMutations}
      ${dealMutations}
      ${purchaseMutations}
      ${taskMutations}
      ${ticketMutations}
      ${formsEnabled ? growthHackMutations : ''}
      ${plMutations}
      ${ptMutations}
      ${checkListMutations}
    }
  `;
};

export default typeDefs;
