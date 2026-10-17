import { gql } from '@apollo/client';
import { techCardFields } from './techCardQueries';

export const TECH_CARD_ADD = gql`
  mutation AccountingTechCardAdd(
    $code: String
    $name: String!
    $description: String
    $duration: Float
    $durationType: String
    $laborCosts: [TechCardCostInput!]
    $overheadCosts: [TechCardCostInput!]
    $inputs: [TechCardItemInput]!
    $outputs: [TechCardItemInput]!
    $status: String
  ) {
    techCardAdd(
      code: $code
      name: $name
      description: $description
      duration: $duration
      durationType: $durationType
      laborCosts: $laborCosts
      overheadCosts: $overheadCosts
      inputs: $inputs
      outputs: $outputs
      status: $status
    ) {
      ...AccountingTechCardFields
    }
  }
  ${techCardFields}
`;

export const TECH_CARD_EDIT = gql`
  mutation AccountingTechCardEdit(
    $_id: String!
    $code: String
    $name: String!
    $description: String
    $duration: Float
    $durationType: String
    $laborCosts: [TechCardCostInput!]
    $overheadCosts: [TechCardCostInput!]
    $inputs: [TechCardItemInput]!
    $outputs: [TechCardItemInput]!
    $status: String
  ) {
    techCardEdit(
      _id: $_id
      code: $code
      name: $name
      description: $description
      duration: $duration
      durationType: $durationType
      laborCosts: $laborCosts
      overheadCosts: $overheadCosts
      inputs: $inputs
      outputs: $outputs
      status: $status
    ) {
      ...AccountingTechCardFields
    }
  }
  ${techCardFields}
`;

export const TECH_CARD_REMOVE = gql`
  mutation AccountingTechCardRemove($_id: String!) {
    techCardRemove(_id: $_id)
  }
`;
