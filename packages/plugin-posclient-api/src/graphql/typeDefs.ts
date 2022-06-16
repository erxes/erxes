import { gql } from 'apollo-server-express';
import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes
} from './schema/user';
import { queries as LogQueries, types as LogTypes } from './schema/logs';
import {
  queries as ErxesQueries,
  types as ErxesTypes,
  mutations as ErxesMutations
} from './schema/erxes';

import {
  mutations as PosUserMutations,
  queries as PosUserQueries,
  types as PosUserTypes
} from './schema/posUser';
import {
  mutations as CustomerMutations,
  queries as CustomerQueries,
  types as CustomerTypes
} from './schema/customer';
import {
  mutations as OrderMutations,
  queries as OrderQueries,
  types as OrderTypes
} from './schema/orders';
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes
} from './schema/configs';
import {
  mutations as PaymentMutations,
  queries as PaymentQueries,
  types as PaymentTypes
} from './schema/payment';
import {
  queries as ProductQueries,
  types as ProductTypes
} from './schema/product';
import {
  queries as ReportQueries,
  types as ReportTypes
} from './schema/report';
import { types as CompanyTypes } from './schema/company';

const typeDefs = async serviceDiscovery => {
  const contactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const formsEnabled = await serviceDiscovery.isEnabled('forms');

  const isEnabled = {
    contacts: contactsEnabled,
    forms: formsEnabled
  };

  return gql`
    scalar JSON
    scalar Date

    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    ${UserTypes}
    ${LogTypes}
    ${ErxesTypes}

    ${PosUserTypes}
    ${ProductTypes}
    ${CompanyTypes}
    ${CustomerTypes}
    ${OrderTypes}
    ${ConfigTypes}
    ${PaymentTypes}
    ${ReportTypes}

  
   extend type Query {
    ${UserQueries}
    ${LogQueries}
    ${ErxesQueries}

    ${PosUserQueries}
    ${ProductQueries}
    ${OrderQueries}
    ${ConfigQueries}
    ${CustomerQueries}
    ${PaymentQueries}
    ${ReportQueries}
   }


  
   extend type Mutation {
    ${UserMutations}
    ${PosUserMutations}
    ${OrderMutations}
    ${ConfigMutations}
    ${PaymentMutations}
    ${CustomerMutations}
    ${ErxesMutations}
   }



   extend type Subscription {
    ordersOrdered(statuses: [String]): Order
   }
  `;
};

export default typeDefs;
