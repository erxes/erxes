import { gql } from 'apollo-server-express';

import { types, mutations, queries } from './schema/rentpay';

const typeDefs = async serviceDiscovery => {
  const cardsEnabled = await serviceDiscovery.isEnabled('cards');
  const formsEnabled = await serviceDiscovery.isEnabled('forms');

  return gql`
    scalar JSON
    scalar Date

    ${types({ cardsEnabled, formsEnabled })}

    extend type Query {
      ${queries({ cardsEnabled, formsEnabled })}
    }

    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
