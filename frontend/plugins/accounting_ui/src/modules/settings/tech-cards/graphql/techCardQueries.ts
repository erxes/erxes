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
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    techCards(
      searchValue: $searchValue
      status: $status
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
