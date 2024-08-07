import gql from "graphql-tag";

import {
  mutations as formSubmissionsMutations,
  types as formSubmissionsType
} from "./schema/formSubmissions";
import {
  mutations as RiskIndicatorsMutations,
  queries as RiskIndicatorsQueries,
  types as RiskIndicatorsTypes
} from "./schema/riskIndicator";

import {
  mutations as OpearionMutations,
  queries as OpearionQueries,
  types as OpearionTypes
} from "./schema/operations";
import {
  mutations as PlanMutations,
  queries as PlanQueries,
  types as PlanTypes
} from "./schema/plans";
import {
  mutations as RiskAsessmentMutations,
  queries as RiskAsessmentQueries,
  types as RiskAsessmentTypes
} from "./schema/riskAssessment";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    extend type User @key(fields: "_id") {
      _id: String! @external
      submitStatus:String
    }

    extend type Branch @key(fields: "_id") {
          _id: String! @external
    }

    extend type Department @key(fields: "_id") {
          _id: String! @external
    }

    extend type Tag @key(fields: "_id") {
          _id: String! @external
    }

    ${RiskIndicatorsTypes()}
    ${OpearionTypes}
    ${RiskAsessmentTypes}
    ${formSubmissionsType}
    ${PlanTypes}
    
    extend type Query {
      ${RiskIndicatorsQueries}
      ${OpearionQueries}
      ${RiskAsessmentQueries}
      ${PlanQueries}
    }
    
    extend type Mutation {
      ${RiskIndicatorsMutations}
      ${formSubmissionsMutations},
      ${OpearionMutations}
      ${RiskAsessmentMutations}
      ${PlanMutations}
    }
  `;
};

export default typeDefs;
