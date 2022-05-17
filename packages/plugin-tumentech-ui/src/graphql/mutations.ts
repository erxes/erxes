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
  $fourAttachments: [AttachmentInput]
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
  fourAttachments: $fourAttachments
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
mutation selectWinner($customerId: String!, $dealId: String!){
  selectWinner(customerId: $customerId,dealId: $dealId) {
    _id
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
  selectWinner
};
