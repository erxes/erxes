import gql from "graphql-tag";
import {
  mutations as boardMutations,
  queries as boardQueries,
  types as boardTypes,
} from "./schema/board";
import {
  mutations as checkListMutations,
  queries as checkListQueries,
  types as checkListTypes,
} from "./schema/checklist";
import {
  mutations as dealMutations,
  queries as dealQueries,
  types as dealTypes,
} from "./schema/deal";

import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { types as CommonTypes } from "./schema/common";
import {
  mutations as plMutations,
  queries as plQueries,
  types as plTypes,
} from "./schema/pipelineLabel";
import {
  mutations as ptMutations,
  queries as ptQueries,
  types as ptTypes,
} from "./schema/pipelineTemplate";

const typeDefs = async () => {
  const contactsEnabled = true;
  const clientPortalEnabled = await isEnabled("clientportal");
  const loyaltyEnabled = await isEnabled("loyalties");

  const isEnabledTable = {
    contacts: contactsEnabled,
    forms: true,
    clientPortal: clientPortalEnabled,
    loyalty: loyaltyEnabled,
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
        : ""
    }

  
        extend type Tag @key(fields: "_id") {
          _id: String! @external
        }
   
    
    ${
      clientPortalEnabled
        ? `
        extend type ClientPortalUser @key(fields: "_id") {
          _id: String! @external
        }
      `
        : ""
    }

    ${
      loyaltyEnabled
        ? `extend type Voucher @key(fields: "_id") {
        _id: String! @external
      }
      
      extend type Coupon @key(fields: "_id") {
        _id: String! @external
      }

      union LoyaltyEntity = Voucher | Coupon
      `
        : ""
    }

    ${boardTypes()}
    ${dealTypes(isEnabledTable)}

    ${plTypes}
    ${ptTypes}
    ${CommonTypes}
    ${checkListTypes}
    
    extend type Query {
      ${boardQueries}
      ${dealQueries}
      ${plQueries}
      ${ptQueries}
      ${checkListQueries}
    }
    
    extend type Mutation {
      ${boardMutations}
      ${dealMutations}
      ${plMutations}
      ${ptMutations}
      ${checkListMutations}
    }
  `;
};

export default typeDefs;
