import { gql } from '~/gql';

export const GET_JOB_PRODUCT_UNITS = gql(`
  query AccountingJobProductUnits($ids: [String]) {
    productsMain(ids: $ids) {
      list {
        _id
        uom
        subUoms
      }
    }
    uoms {
      _id
      code
      name
    }
  }
`);

export const jobFields = gql(`
  fragment AccountingJobFields on Job {
    _id
    code
    name
    description
    duration
    durationType
    laborCosts {
      name
      amount
      accountId
    }
    overheadCosts {
      name
      amount
      accountId
    }
    status
    inputs {
      productId
      uom
      quantity
      costRatio
    }
    outputs {
      productId
      uom
      quantity
      costRatio
    }
  }
`);

export const GET_JOBS = gql(`
  query AccountingJobs(
    $searchValue: String
    $status: String
    $hasLabor: Boolean
    $hasOverhead: Boolean
    $laborCostName: String
    $overheadCostName: String
    $inputProductId: String
    $outputProductId: String
    $durationType: String
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    jobs(
      searchValue: $searchValue
      status: $status
      hasLabor: $hasLabor
      hasOverhead: $hasOverhead
      laborCostName: $laborCostName
      overheadCostName: $overheadCostName
      inputProductId: $inputProductId
      outputProductId: $outputProductId
      durationType: $durationType
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      jobs {
        ...AccountingJobFields
      }
      totalCount
    }
  }
`);

export const GET_JOB_DETAIL = gql(`
  query AccountingJobDetail($_id: String!) {
    jobDetail(_id: $_id) {
      ...AccountingJobFields
    }
  }
`);

export const GET_JOB_OUTPUTS = gql(`
  query AccountingJobOutputs(
    $searchValue: String
    $status: String
    $hasLabor: Boolean
    $hasOverhead: Boolean
    $duplicatedOutput: Boolean
    $laborCostName: String
    $overheadCostName: String
    $inputProductId: String
    $outputProductId: String
    $durationType: String
    $page: Int
    $perPage: Int
  ) {
    jobOutputs(
      searchValue: $searchValue
      status: $status
      hasLabor: $hasLabor
      hasOverhead: $hasOverhead
      duplicatedOutput: $duplicatedOutput
      laborCostName: $laborCostName
      overheadCostName: $overheadCostName
      inputProductId: $inputProductId
      outputProductId: $outputProductId
      durationType: $durationType
      page: $page
      perPage: $perPage
    ) {
      rows {
        _id
        job {
          ...AccountingJobFields
        }
        output {
          productId
          uom
          quantity
          costRatio
        }
        outputIndex
      }
      totalCount
    }
  }
`);
