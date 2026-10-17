import { gql } from '@apollo/client';

export const GET_TECH_CARD_PRODUCT_UNITS = gql`
  query AccountingTechCardProductUnits($ids: [String]) {
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
`;

export const techCardFields = gql`
  fragment AccountingTechCardFields on TechCard {
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
`;

export const GET_TECH_CARDS = gql`
  query AccountingTechCards(
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
    techCards(
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
      techCards {
        ...AccountingTechCardFields
      }
      totalCount
    }
  }
  ${techCardFields}
`;

export const GET_TECH_CARD_DETAIL = gql`
  query AccountingTechCardDetail($_id: String!) {
    techCardDetail(_id: $_id) {
      ...AccountingTechCardFields
    }
  }
  ${techCardFields}
`;

export const GET_TECH_CARD_OUTPUTS = gql`
  query AccountingTechCardOutputs(
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
    techCardOutputs(
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
        techCard {
          ...AccountingTechCardFields
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
  ${techCardFields}
`;
