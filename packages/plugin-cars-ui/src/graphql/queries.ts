import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity/graphql/queries';
import { isEnabled } from '@erxes/ui/src/utils/core';

const carCategoryFields = `
  _id
  name
  order
  code
  parentId
  description
  isRoot
  image {
      url
      name
      size
      type
    }
  secondaryImages {
      url
      name
      size
      type
    }
`;

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
  categoryId
  category {
    ${carCategoryFields}
  }
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

export const carCounts = `
  query carCounts(${listParamsDef}, $only: String) {
    carCounts(${listParamsValue}, only: $only)
  }
`;

const carCountByTags = `
  query carCountByTags {
    carCountByTags
  }
`;

const carCategories = `
  query carCategories {
    carCategories {
      ${carCategoryFields}
      carCount
    }
  }
`;

const carCategoriesCount = `
  query carCategoriesTotalCount {
    carCategoriesTotalCount
  }
`;

const carCategoryDetail = `
  query carCategoryDetail($_id: String) {
    carCategoryDetail(_id: $_id) {
      ${carCategoryFields}
      carCount
    }
  }
`;

export const carDetail = `
  query carDetail($_id: String!) {
    carDetail(_id: $_id) {
      ${carFields}
      ${
        isEnabled('contacts')
          ? `
            customers {
              _id
              firstName
              lastName
              primaryEmail
              primaryPhone
            }
            companies {
              _id
              primaryName
              website
            }
            `
          : ``
      }
      attachment {
        url
        name
        size
        type
      }
      customFieldsData
    }
  }
`;

const carsExport = `
  query carsExport(${listParamsDef}) {
    carsExport(${listParamsValue})
  }
`;

export default {
  cars,
  carsMain,
  carCounts,
  carDetail,
  carsExport,
  carCategories,
  carCategoriesCount,
  carCategoryDetail,
  carCountByTags
};
