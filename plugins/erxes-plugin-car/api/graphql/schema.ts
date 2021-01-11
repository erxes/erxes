export const types = `
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

    customers: [Customer]
    companies: [Company]

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
`;
