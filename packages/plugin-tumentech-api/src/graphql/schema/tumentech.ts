export const types = () => `
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

    customers: [Customer]
    companies: [Company]

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
    model: String
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
    productIds: [String]
    products: JSON
  }

  type ProductCarCategories {
    _id: String
    productId: String
    carCategoryIds: [String]
    carCategories: JSON
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
  productMatchCarCategories(productId: String): ProductCarCategories

  cpCarCounts(${tumentechParams}, only: String): JSON
  cpCarDetail(_id: String!): Car
  cpCarCategories(parentId: String, searchValue: String): [CarCategory]
  cpCarCategoriesTotalCount: Int
  cpCarCategoryDetail(_id: String): CarCategory
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
  model: String
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

export const mutations = `
  carsAdd(${tumentechCommonFields}): Car
  carsEdit(_id: String!, ${tumentechCommonFields}): Car
  carsRemove(carIds: [String]): [String]
  carsMerge(carIds: [String], carFields: JSON) : Car
  carCategoriesAdd(${carCategoryParams}): CarCategory
  carCategoriesEdit(_id: String!, ${carCategoryParams}): CarCategory
  carCategoriesRemove(_id: String!): JSON

  carCategoryMatch( carCategoryId: String!, productIds: [String]): CarCategoryProducts
  productMatch(productId: String!, carCategoryIds: [String]): ProductCarCategories
  cpCarsAdd(${tumentechCommonFields}, customerId: String, companyId: String): Car
  cpCarsEdit(_id: String!, ${tumentechCommonFields}): Car
  cpCarsRemove(carIds: [String]): [String]
`;
