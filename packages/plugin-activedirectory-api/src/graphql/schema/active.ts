import {
  attachmentType,
  attachmentInput,
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }


        extend type Tag @key(fields: "_id") {
          _id: String! @external
        }


     extend type Customer @key(fields: "_id") {
          _id: String! @external
        }

        extend type Company @key(fields: "_id") {
          _id: String! @external
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

    getTags: [Tag]
    tagIds: [String]
    plateNumber: String
    vinNumber: String
    colorCode: String
    categoryId: String
    bodyType: String
    fuelType: String
    gearBox: String
    vintageYear: Float
    importYear: Float
    attachment: Attachment
    customFieldsData: JSON
  }
  type CarsListResponse {
    list: [Car],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  tag: String
  segment: String
  segmentData: String
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
  customFieldsData: JSON
`;

export const mutations = `
  activeAdd(${commonFields}): Car
  activeEdit(_id: String!, ${commonFields}, customFieldsData: JSON): Car
  activeRemove(carIds: [String]): [String]
`;
