import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = ({ contacts }) => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  ${
    contacts
      ? `
        extend type Customer @key(fields: "_id") {
          _id: String! @external
        }

        extend type Company @key(fields: "_id") {
          _id: String! @external
        }
        `
      : ''
  }
  

  type CarCategory {
    _id: String!
    name: String
    description: String
    parentId: String
    code: String!
    order: String!
    isRoot: Boolean
    carCount: Int
  }
  type Car {
    _id: String!
    createdAt: Date
    modifiedAt: Date
    ownerId: String
    mergedIds: [String]
    description: String
    owner: User
    ${
      contacts
        ? `
      customers: [Customer]
      companies: [Company]
      `
        : ''
    }
    
    plateNumber: String
    vinNumber: String
    colorCode: String
    categoryId: String
    category: CarCategory
    bodyType: String
    fuelType: String
    gearBox: String
    vintageYear: Float
    importYear: Float
    attachment: Attachment
  }
  type CarsListResponse {
    list: [Car],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  segment: String
  categoryId: String
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
  brand: String
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

export const queries = `
  carsMain(${queryParams}): CarsListResponse
  cars(${queryParams}): [Car]
  carCounts(${queryParams}, only: String): JSON
  carDetail(_id: String!): Car
  carCategories(parentId: String, searchValue: String): [CarCategory]
  carCategoriesTotalCount: Int
  carCategoryDetail(_id: String): CarCategory
  cpCarDetail(_id: String!): Car
  cpCarCategories(parentId: String, searchValue: String): [CarCategory]
  cpCarCategoriesTotalCount: Int
  cpCarCategoryDetail(_id: String): CarCategory
`;

const commonFields = `
  ownerId: String,
  description: String
  plateNumber: String
  vinNumber: String
  colorCode: String
  categoryId: String
  bodyType: String
  fuelType: String
  gearBox: String
  vintageYear: Float
  importYear: Float
  attachment: AttachmentInput
`;

const carCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  parentId: String,
`;

export const mutations = `
  carsAdd(${commonFields}): Car
  carsEdit(_id: String!, ${commonFields}): Car
  carsRemove(carIds: [String]): [String]
  carsMerge(carIds: [String], carFields: JSON) : Car
  carCategoriesAdd(${carCategoryParams}): CarCategory
  carCategoriesEdit(_id: String!, ${carCategoryParams}): CarCategory
  carCategoriesRemove(_id: String!): JSON
  cpCarsAdd(${commonFields}, customerId: String, companyId: String): Car
  cpCarsEdit(_id: String!, ${commonFields}, customerId: String, companyId: String): Car
  cpCarsRemove(carIds: [String]): [String]
`;
