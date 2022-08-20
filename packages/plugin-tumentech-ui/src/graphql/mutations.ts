import { carFields } from './queries';

const commonFields = `
  $description: String,

  $plateNumber: String,
  $vinNumber: String,
  $color: String,
  $categoryId: String,

  $fuelType: String,
  $engineChange: String,
  $listChange: String,

  $vintageYear: Float,
  $importYear: Float,

  $diagnosisDate: Date
  $taxDate: Date
  $meterWarranty: Date

  $weight: Float
  $engineCapacity: String
  $liftHeight: Float
  $height: Float

  $steeringWheel: String

  $ownerBy: String
  $repairService: String
  $transmission: String
  $carModel: String
  $manufacture: String
  $mark: String
  $type: String
  $drivingClassification: String
  $seats: String
  $doors: String
  $trailerType: String
  $tireLoadType: String
  $bowType: String
  $brakeType: String
  $liftType: String
  $totalAxis: String 
  $steeringAxis: String
  $forceAxis: String
  $floorType: String
  $barrelNumber: String
  $pumpCapacity: String
  $interval: [String]
  $intervalValue: String
  $wagonCapacity: [String]
  $liftWagonCapacity: [String]
  $wagonCapacityValue: String
  $liftWagonCapacityValue: String
  $running: String
  $runningValue: Float

  $wagonLength: Float
  $wagonWidth: Float

  $porchekHeight: Float
  $volume: Float
  $capacityL: Float
  $barrel1: Float
  $barrel2: Float
  $barrel3: Float
  $barrel4: Float
  $barrel5: Float
  $barrel6: Float
  $barrel7: Float
  $barrel8: Float

  $forceCapacityValue: Float 
  $forceValue: Float

  $attachments: [AttachmentInput]
  $frontAttachments: [AttachmentInput]
  $leftAttachments: [AttachmentInput]
  $rightAttachments: [AttachmentInput]
  $backAttachments: [AttachmentInput]
  $floorAttachments: [AttachmentInput]
  $transformationAttachments: [AttachmentInput]
`;

const commonVariables = `
  description: $description,

  plateNumber: $plateNumber,
  vinNumber: $vinNumber,
  color: $color,
  categoryId: $categoryId,

  fuelType: $fuelType,
  engineChange: $engineChange,
  listChange: $listChange,

  vintageYear: $vintageYear,
  importYear: $importYear,

  taxDate: $taxDate,
  meterWarranty: $meterWarranty,
  diagnosisDate: $diagnosisDate,

  weight: $weight,
  seats: $seats,
  doors: $doors,
  engineCapacity: $engineCapacity,
  liftHeight: $liftHeight,
  height: $height,

  steeringWheel: $steeringWheel,

  ownerBy: $ownerBy,
  repairService: $repairService,
  transmission: $transmission,
  carModel: $carModel,
  manufacture: $manufacture,
  mark: $mark,
  type: $type,
  drivingClassification: $drivingClassification,
  trailerType: $trailerType,
  tireLoadType: $tireLoadType,
  bowType: $bowType,
  brakeType: $brakeType,
  liftType: $liftType,
  totalAxis: $totalAxis,
  steeringAxis: $steeringAxis,
  forceAxis: $forceAxis,
  floorType: $floorType,
  barrelNumber: $barrelNumber,
  pumpCapacity: $pumpCapacity,
  interval: $interval,
  intervalValue: $intervalValue,
  wagonCapacity: $wagonCapacity,
  liftWagonCapacity: $liftWagonCapacity,
  liftWagonCapacityValue: $liftWagonCapacityValue,
  running: $running,
  runningValue: $runningValue,

  wagonLength: $wagonLength,
  wagonWidth: $wagonWidth,
  wagonCapacityValue: $wagonCapacityValue,

  porchekHeight: $porchekHeight,
  volume: $volume,
  capacityL: $capacityL,
  barrel1: $barrel1,
  barrel2: $barrel2,
  barrel3: $barrel3,
  barrel4: $barrel4,
  barrel5: $barrel5,
  barrel6: $barrel6,
  barrel7: $barrel7,
  barrel8: $barrel8,

  forceCapacityValue: $forceCapacityValue,
  forceValue: $forceValue,

  attachments: $attachments,
  frontAttachments: $frontAttachments
  leftAttachments: $leftAttachments
  rightAttachments: $rightAttachments
  backAttachments: $backAttachments
  floorAttachments: $floorAttachments
  transformationAttachments: $transformationAttachments
`;

const carsAdd = `
  mutation carsAdd(${commonFields}) {
    carsAdd(${commonVariables}) {
      ${carFields}
    }
  }
`;

const carsEdit = `
  mutation carsEdit($_id: String!, ${commonFields}) {
    carsEdit(_id: $_id, ${commonVariables}) {
      ${carFields}
    }
  }
`;

const carsRemove = `
  mutation carsRemove($carIds: [String]) {
    carsRemove(carIds: $carIds)
  }
`;

const carsMerge = `
  mutation carsMerge($carIds: [String], $carFields: JSON) {
    carsMerge(carIds: $carIds, carFields: $carFields) {
      _id
    }
  }
`;

const carCategoryParamsDef = `
  $name: String!,
  $code: String!,
  $parentId: String,
  $description: String,
  $collapseContent: [String]
`;

const carCategoryParams = `
  name: $name,
  code: $code,
  parentId: $parentId,
  description: $description,
  collapseContent: $collapseContent
`;

const carCategoryAdd = `
  mutation carCategoriesAdd(${carCategoryParamsDef}) {
    carCategoriesAdd(${carCategoryParams}) {
      _id
    }
  }
`;

const carCategoryEdit = `
  mutation carCategoriesEdit($_id: String!, ${carCategoryParamsDef}) {
    carCategoriesEdit(_id: $_id, ${carCategoryParams}) {
      _id
    }
  }
`;

const carCategoryRemove = `
  mutation carCategoriesRemove($_id: String!) {
    carCategoriesRemove(_id: $_id)
  }
`;

const productCategoryRemove = `
  mutation productCategoriesRemove($_id: String!) {
    productCategoriesRemove(_id: $_id)
  }
`;

const productsRemove = `
  mutation productsRemove($productIds: [String!]) {
    productsRemove(productIds: $productIds)
  }
`;

const carCategoryMatch = `
  mutation carCategoryMatch($carCategoryId: String!, $productCategoryIds: [String]) {
    carCategoryMatch (carCategoryId: $carCategoryId, productCategoryIds : $productCategoryIds){
      _id
    }
  }
`;

const productMatch = `
  mutation productMatch($productCategoryId: String!, $carCategoryIds: [String]) {
    productMatch (productCategoryId: $productCategoryId, carCategoryIds : $carCategoryIds){
      _id
    }
  }
`;

const addParticipants = `
mutation participantsAdd($customerId: String, $dealId: String, $customerIds: [String]){
  participantsAdd(customerId: $customerId, dealId: $dealId, customerIds: $customerIds) {
    _id
  }
}
`;

const removeParticipants = `
mutation participantsRemove($id: String, $doc: [ParticipantsRemove]) {
  participantsRemove(_id: $id, doc: $doc)
}
`;

const removeParticipantsFromDeal = `
mutation participantsRemoveFromDeal($dealId: String!, $customerIds: [String]){
  participantsRemoveFromDeal(dealId: $dealId, customerIds: $customerIds)
}`;

const selectWinner = `
mutation selectWinner($dealId: String!, $driverId: String!) {
  selectWinner(dealId: $dealId, driverId: $driverId) {
    _id
  }
}
`;

const addDirection = `
mutation directionsAdd($placeIds: [String]!, $totalDistance: Int, $roadConditions: [String], $duration: Int, $routeCode: String, $roadCode: String) {
  directionsAdd(placeIds: $placeIds, totalDistance: $totalDistance, roadConditions: $roadConditions, duration: $duration, routeCode: $routeCode, roadCode: $roadCode) {
    _id
  }
}
`;

const editDirection = `
mutation directionsEdit($_id: String!, $placeIds: [String]!, $totalDistance: Int, $roadConditions: [String], $duration: Int, $routeCode: String, $roadCode: String, $googleMapPath: String) {
  directionsEdit(_id: $_id, placeIds: $placeIds, totalDistance: $totalDistance, roadConditions: $roadConditions, duration: $duration, routeCode: $routeCode, roadCode: $roadCode, googleMapPath: $googleMapPath) {
    _id
  }
}`;

const removeDirection = `
mutation directionsRemove($_id: String!) {
  directionsRemove(_id: $_id)
}
`;

const saveDirectionPath = `
mutation directionsSavePath($_id: String!, $googleMapPath: [JSON]) {
  directionsSavePath(_id: $_id, googleMapPath: $googleMapPath) {
    _id
  }
}
`;

const addRoute = `
mutation routesAdd($code: String!, $name: String!, $directionIds: [String]) {
  routesAdd(code: $code, name: $name, directionIds: $directionIds) {
    _id
  }
}
`;

const editRoute = `
mutation routesEdit($_id: String!, $code: String!, $name: String!, $directionIds: [String]) {
  routesEdit(_id: $_id, code: $code, name: $name, directionIds: $directionIds) {
    _id
  }
}
`;

const removeRoute = `
mutation routesRemove($_id: String!) {
  routesRemove(_id: $_id)
}
`;

const addPlace = `
mutation placesAdd($province: String!, $name: String!, $code: String!, $center: JSON!) {
  placesAdd(province: $province, name: $name, code: $code, center: $center) {
    province
    code
    name
    center
  }
}
`;

const editPlace = `
mutation placesEdit($_id: String!, $province: String!, $name: String!, $code: String!, $center: JSON!) {
  placesEdit(_id: $_id, province: $province, name: $name, code: $code, center: $center) {
    province
    name
    code
    center
  }
}
`;

const removePlace = `
mutation placesRemove($_id: String!) {
  placesRemove(_id: $_id)
}
`;

const setDealPlace = `
mutation setDealPlace(
  $dealId: String!
  $endPlaceId: String
  $startPlaceId: String
) {
  setDealPlace(
    dealId: $dealId
    endPlaceId: $endPlaceId
    startPlaceId: $startPlaceId
  ) {
    dealId
    endPlaceId
    startPlaceId
  }
}
`;

export default {
  carsAdd,
  carsEdit,
  carsRemove,
  carsMerge,
  carCategoryAdd,
  carCategoryEdit,
  carCategoryRemove,
  productCategoryRemove,
  productsRemove,

  carCategoryMatch,
  productMatch,

  addParticipants,
  removeParticipants,
  removeParticipantsFromDeal,
  selectWinner,

  addPlace,
  editPlace,
  removePlace,
  setDealPlace,

  addDirection,
  editDirection,
  saveDirectionPath,
  removeDirection,

  addRoute,
  editRoute,
  removeRoute
};
