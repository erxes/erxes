import gql from 'graphql-tag';

import { types, mutations, queries } from './schema/rentpay';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const cardsEnabled = await isEnabled('cards');
  const formsEnabled = await isEnabled('forms');

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
