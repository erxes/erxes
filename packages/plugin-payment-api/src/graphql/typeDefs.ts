import { gql } from 'apollo-server-express';

import {
  queries as invoiceQueries,
  types as invoiceTypes,
  mutations as invoiceMutations
} from './schema/invoices';

import {
  queries as paymentQueries,
  types as paymentTypes,
  mutations as paymentMutations
} from './schema/payments';

import {
  queries as configsQueries,
  mutations as configsMutations,
  types as configsTypes
} from './schema/paymentConfigs';

const typeDefs = async serviceDiscovery => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const cardsAvailable = await serviceDiscovery.isEnabled('cards');

  const isEnabled = {
    contacts: isContactsEnabled,
    cards: cardsAvailable
  };

  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }
    
    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
    
    ${invoiceTypes}
    ${paymentTypes}
    ${configsTypes}

    
    extend type Query {
      ${invoiceQueries}
      ${paymentQueries}
      ${configsQueries}
    }
    
    extend type Mutation {
      ${paymentMutations}
      ${configsMutations}
      ${invoiceMutations}
    }
  `;
};

export default typeDefs;
