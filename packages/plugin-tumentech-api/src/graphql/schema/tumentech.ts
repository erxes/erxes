import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = ({ contacts, cards }) => `

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

  ${
    cards
      ? `
    extend type Stage @key(fields: "_id") {
      _id: String! @external
    }
    extend type Deal @key(fields: "_id") {
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
  collapseContent: [String]
  code: String!
  order: String!

  isRoot: Boolean
  carCount: Int
}

type Car {
  _id: String!

  createdAt: Date
  modifiedAt: Date
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
  color: String
  categoryId: String


  category: CarCategory
  fuelType: String
  engineChange: String
  listChange: String

  vintageYear: Float
  importYear: Float

  taxDate: Date
  meterWarranty: Date
  diagnosisDate: Date

  weight: Float
  engineCapacity: String
  liftHeight: Float
  height: Float

  steeringWheel: String

  ownerBy: String
  repairService: String
  transmission: String
  carModel: String
  manufacture: String
  mark: String
  type: String
  drivingClassification: String
  doors: String
  seats: String
  trailerType: String
  tireLoadType: String
  bowType: String
  brakeType: String
  liftType: String
  totalAxis: String
  steeringAxis: String
  forceAxis: String
  floorType: String
  barrelNumber: String
  pumpCapacity: String
  interval: [String]
  intervalValue: String
  wagonCapacity: [String]
  liftWagonCapacity: [String]
  wagonCapacityValue: String
  liftWagonCapacityValue: String
  running: String
  runningValue: Float

  trailerManufacture: String

  wagonLength: Float
  wagonWidth: Float

  porchekHeight: Float
  volume: Float
  capacityL: Float
  barrel1: Float
  barrel2: Float
  barrel3: Float
  barrel4: Float
  barrel5: Float
  barrel6: Float
  barrel7: Float
  barrel8: Float

  forceCapacityValue: Float
  forceValue: Float

  attachments: [Attachment]
  fourAttachments: [Attachment]
  floorAttachments: [Attachment]
  transformationAttachments: [Attachment]
}

type CarsListResponse {
  list: [Car],
  totalCount: Float,
}

type CarCategoryProducts {
  _id: String
  carCategoryId: String
  productCategoryIds: [String]
  productCategories: JSON
}

type ProductCarCategories {
  _id: String
  productCategoryId: String
  carCategoryIds: [String]
  carCategories: JSON
}

type Participant @key(fields: "_id") @cacheControl(maxAge: 3) {
  _id: String!
  customerId: String!
  dealId: String!
  status: String!

  createdAt: Date
  detail: JSON

  ${
    contacts
      ? `
      customer: Customer
    `
      : ''
  }

  ${
    cards
      ? `
      deal: Deal
    `
      : ''
  }
}

input ParticipantsRemove {
  dealId: String!
  customerId: String!
}
`;

const tumentechParams = `
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
  carsMain(${tumentechParams}): CarsListResponse
  cars(${tumentechParams}): [Car]
  carCounts(${tumentechParams}, only: String): JSON
  carDetail(_id: String!): Car
  carCategories(parentId: String, searchValue: String): [CarCategory]
  carCategoriesTotalCount: Int
  carCategoryDetail(_id: String): CarCategory
  carCategoryMatchProducts(carCategoryId: String): CarCategoryProducts
  productMatchCarCategories(productCategoryId: String): ProductCarCategories

  cpCarCounts(${tumentechParams}, only: String): JSON
  cpCarDetail(_id: String!): Car
  cpCarCategories(parentId: String, searchValue: String): [CarCategory]
  cpCarCategoriesTotalCount: Int
  cpCarCategoryDetail(_id: String): CarCategory

  participants(page: Int, perPage: Int, customerId: String, dealId: String, status: String): [Participant]
  participantDetail(_id: String!): Participant
  participantsTotalCount(customerId: String, dealId: String, status: String): Int
`;

const tumentechCommonFields = `
  description: String
  plateNumber: String
  vinNumber: String
  color: String

  categoryId: String
  fuelType: String
  engineChange: String
  listChange: String

  vintageYear: Float
  importYear: Float
  taxDate: Date
  meterWarranty: Date
  diagnosisDate: Date

  weight: Float
  engineCapacity: String
  liftHeight: Float
  height: Float

  steeringWheel: String

  ownerBy: String
  repairService: String
  transmission: String
  carModel: String
  manufacture: String
  mark: String
  type: String
  drivingClassification: String
  doors: String
  seats: String
  bowType: String
  brakeType: String
  liftType: String
  totalAxis: String
  steeringAxis: String
  forceAxis: String
  floorType: String
  barrelNumber: String
  pumpCapacity: String
  trailerType: String
  tireLoadType: String
  interval: [String]
  intervalValue: String
  wagonCapacity: [String]
  liftWagonCapacity: [String]
  wagonCapacityValue: String
  liftWagonCapacityValue: String
  running: String
  runningValue: Float

  trailerManufacture: String

  wagonLength: Float
  wagonWidth: Float

  porchekHeight: Float
  volume: Float
  capacityL: Float
  barrel1: Float
  barrel2: Float
  barrel3: Float
  barrel4: Float
  barrel5: Float
  barrel6: Float
  barrel7: Float
  barrel8: Float

  forceCapacityValue: Float
  forceValue: Float

  attachments: [AttachmentInput]
  fourAttachments: [AttachmentInput]
  floorAttachments: [AttachmentInput]
  transformationAttachments: [AttachmentInput]
`;

const carCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  parentId: String,
  collapseContent: [String]
`;

const participantParams = `
  customerId: String
  dealId: String
  detail: JSON
`;

export const mutations = `
  carsAdd(${tumentechCommonFields}): Car
  carsEdit(_id: String!, ${tumentechCommonFields}): Car
  carsRemove(carIds: [String]): [String]
  carsMerge(carIds: [String], carFields: JSON) : Car
  carCategoriesAdd(${carCategoryParams}): CarCategory
  carCategoriesEdit(_id: String!, ${carCategoryParams}): CarCategory
  carCategoriesRemove(_id: String!): JSON

  carCategoryMatch( carCategoryId: String!, productCategoryIds: [String]): CarCategoryProducts
  productMatch(productCategoryId: String!, carCategoryIds: [String]): ProductCarCategories
  cpCarsAdd(${tumentechCommonFields}, customerId: String, companyId: String): Car
  cpCarsEdit(_id: String!, ${tumentechCommonFields}): Car
  cpCarsRemove(carIds: [String]): [String]

  participantsAdd(${participantParams} customerIds: [String]): [Participant]
  participantsEdit(_id: String! status:String ${participantParams}): Participant
  participantsRemove(_id: String, doc: [ParticipantsRemove]): JSON
  participantsRemoveFromDeal(dealId: String!, customerIds: [String]): JSON
  selectWinner(dealId: String!, customerId: String!): Participant
`;
