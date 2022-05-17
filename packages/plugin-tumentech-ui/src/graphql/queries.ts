import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity';
import { queries as productQueries } from '@erxes/ui-products/src/graphql';

const productFields = productQueries.productFields;

const productCategories = productQueries.productCategories;

const products = productQueries.products;

const productsCount = `
  query productsTotalCount($type: String) {
    productsTotalCount(type: $type)
  }
`;

const productCountByTags = `
  query productCountByTags {
    productCountByTags
  }
`;

const productCategoriesCount = `
  query productCategoriesTotalCount {
    productCategoriesTotalCount
  }
`;

const productDetail = `
  query productDetail($_id: String) {
    productDetail(_id: $_id) {
      ${productFields}
      customFieldsData
      vendor {
        _id
        code
        primaryName
      }
    }
  }
`;

const productCategoryDetail = `
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      name
      productCount
    }
  }
`;

const carCategoryFields = `
  _id
  name
  order
  code
  parentId
  description
  collapseContent

  isRoot
`;

export const carFields = `
  _id
  createdAt
  modifiedAt
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
  color
  fuelType
  engineChange
  listChange
  vintageYear
  importYear
  taxDate
  meterWarranty
  diagnosisDate

  weight
  seats
  doors
  engineCapacity
  liftHeight
  height

  steeringWheel

  ownerBy
  repairService
  transmission
  carModel
  manufacture
  mark
  type
  drivingClassification
  trailerType
  tireLoadType
  bowType
  brakeType
  liftType
  totalAxis
  steeringAxis
  forceAxis
  floorType
  barrelNumber
  pumpCapacity
  interval
  intervalValue
  running
  runningValue
  
  wagonLength
  wagonWidth
  wagonCapacity
  wagonCapacityValue
  liftWagonCapacity
  liftWagonCapacityValue

  porchekHeight
  volume
  capacityL
  barrel1
  barrel2
  barrel3
  barrel4
  barrel5
  barrel6
  barrel7
  barrel8

  forceCapacityValue
  forceValue

`;

const listParamsDef = `
  $page: Int
  $perPage: Int
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

      attachments {
        name
        url
        type
        size
      }
      fourAttachments {
        name
        url
        type
        size
      }
      floorAttachments {
        name
        url
        type
        size
      }
      transformationAttachments {
        name
        url
        type
        size
      }
    }
  }
`;

const carCategoryMatchProducts = `
  query carCategoryMatchProducts($carCategoryId: String) {
    carCategoryMatchProducts(carCategoryId: $carCategoryId) {
      _id
      carCategoryId
      productCategoryIds
      productCategories
    }
  }
`;

const productCategoryMatchCarCategories = `
  query productMatchCarCategories($productCategoryId: String) {
    productMatchCarCategories(productCategoryId: $productCategoryId) {
      _id
      productCategoryId
      carCategoryIds
      carCategories
    }
  }
`;

const carsExport = `
  query carsExport(${listParamsDef}) {
    carsExport(${listParamsValue})
  }
`;

const participants = `
query($dealId: String) {
  participants (dealId: $dealId){
    _id
    deal {
      _id
    }
  status
  detail
    customer {
      _id
      avatar
      firstName
      lastName
      primaryEmail
      primaryPhone
    }
  }
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
  products,
  productDetail,
  productCountByTags,
  productsCount,
  productCategories,
  productCategoriesCount,
  productCategoryDetail,
  carCategoryMatchProducts,
  productCategoryMatchCarCategories,
  participants
};
