import {
  conformityQueryFieldDefs,
  conformityQueryFields,
} from '@erxes/ui-sales/src/conformity/graphql/queries';

const carFields = `
  _id
  createdAt
  modifiedAt
  ownerId
  owner {
    _id
    details {
      fullName
    }
    email
  }
  mergedIds
  description
  plateNumber
  vinNumber
 
  colorCode
  bodyType
  fuelType
  gearBox
  vintageYear
  importYear
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $tag: String
  $segment: String
  $categoryId: String
  $ids: [String]
  $searchValue: String
  $brand: String
  $sortField: String
  $sortDirection: Int
  ${conformityQueryFields}
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  tag: $tag
  segment: $segment
  categoryId: $categoryId
  ids: $ids
  searchValue: $searchValue
  brand: $brand
  sortField: $sortField
  sortDirection: $sortDirection
  ${conformityQueryFieldDefs}
`;

export const cars = `
  query cars(${listParamsDef}) {
    cars(${listParamsValue}) {
      ${carFields}
    }
  }
`;

export const carsMain = `
  query carsMain(${listParamsDef}) {
    carsMain(${listParamsValue}) {
      list {
        ${carFields}
      }

      totalCount
    }
  }
`;

export default {
  cars,
  carsMain,
};
