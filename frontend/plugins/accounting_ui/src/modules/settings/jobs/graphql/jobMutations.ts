import { gql } from '~/gql';

export const JOB_ADD = gql(`
  mutation AccountingJobAdd(
    $code: String
    $name: String!
    $description: String
    $duration: Float
    $durationType: String
    $laborCosts: [JobCostInput!]
    $overheadCosts: [JobCostInput!]
    $inputs: [JobItemInput!]!
    $outputs: [JobItemInput!]!
    $status: String
  ) {
    jobAdd(
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
      ...AccountingJobFields
    }
  }
`);

export const JOB_EDIT = gql(`
  mutation AccountingJobEdit(
    $_id: String!
    $code: String
    $name: String!
    $description: String
    $duration: Float
    $durationType: String
    $laborCosts: [JobCostInput!]
    $overheadCosts: [JobCostInput!]
    $inputs: [JobItemInput!]!
    $outputs: [JobItemInput!]!
    $status: String
  ) {
    jobEdit(
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
      ...AccountingJobFields
    }
  }
`);

export const JOB_REMOVE = gql(`
  mutation AccountingJobRemove($_id: String!) {
    jobRemove(_id: $_id)
  }
`);
