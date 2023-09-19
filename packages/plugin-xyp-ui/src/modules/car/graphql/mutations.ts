const add = `
mutation xypDataAdd($contentType: String, $contentTypeId: String, $data: JSON){
  xypDataAdd(contentType: $contentType, contentTypeId: $contentTypeId, data: $data) {
    _id
    data
  }
}

`;

const remove = `
  mutation xypRemove($_id: String!){
    xypRemove(_id: $_id)
  }
  `;

const edit = `
  mutation xypEdit($contentType: String, $contentTypeId: String, $data: JSON){
    xypEdit(contentType: $contentType, contentTypeId: $contentTypeId, data: $data){
      _id
    }
  }
  `;
const carsEdit = `
mutation carsEdit($_id: String!, $description: String, $plateNumber: String, $vinNumber: String, $color: String, $carCategoryId: String, $fuelType: String, $engineChange: String, $listChange: String, $vintageYear: Float, $importYear: Float, $diagnosisDate: Date, $taxDate: Date, $barrelWarranty: Date, $weight: Float, $engineCapacity: String, $liftHeight: Float, $height: Float, $steeringWheel: String, $ownerBy: String, $repairService: String, $transmission: String, $carModel: String, $manufacture: String, $mark: String, $type: String, $drivingClassification: String, $seats: String, $doors: String, $trailerType: String, $tireLoadType: String, $bowType: String, $brakeType: String, $liftType: String, $totalAxis: String, $steeringAxis: String, $forceAxis: String, $floorType: String, $barrelNumber: String, $valve: String, $interval: [String], $intervalValue: String, $wagonCapacity: [String], $liftWagonCapacity: [String], $wagonCapacityValue: String, $liftWagonCapacityValue: String, $running: String, $runningValue: Float, $wagonLength: Float, $wagonWidth: Float, $porchekHeight: Float, $volume: Float, $capacityL: Float, $barrel1: Float, $barrel2: Float, $barrel3: Float, $barrel4: Float, $barrel5: Float, $barrel6: Float, $barrel7: Float, $barrel8: Float, $forceCapacityValue: Float, $forceValue: Float, $attachments: [AttachmentInput], $frontAttachments: [AttachmentInput], $leftAttachments: [AttachmentInput], $rightAttachments: [AttachmentInput], $backAttachments: [AttachmentInput], $floorAttachments: [AttachmentInput], $transformationAttachments: [AttachmentInput]) {
  carsEdit(
    _id: $_id
    description: $description
    plateNumber: $plateNumber
    vinNumber: $vinNumber
    color: $color
    carCategoryId: $carCategoryId
    fuelType: $fuelType
    engineChange: $engineChange
    listChange: $listChange
    vintageYear: $vintageYear
    importYear: $importYear
    taxDate: $taxDate
    barrelWarranty: $barrelWarranty
    diagnosisDate: $diagnosisDate
    weight: $weight
    seats: $seats
    doors: $doors
    engineCapacity: $engineCapacity
    liftHeight: $liftHeight
    height: $height
    steeringWheel: $steeringWheel
    ownerBy: $ownerBy
    repairService: $repairService
    transmission: $transmission
    carModel: $carModel
    manufacture: $manufacture
    mark: $mark
    type: $type
    drivingClassification: $drivingClassification
    trailerType: $trailerType
    tireLoadType: $tireLoadType
    bowType: $bowType
    brakeType: $brakeType
    liftType: $liftType
    totalAxis: $totalAxis
    steeringAxis: $steeringAxis
    forceAxis: $forceAxis
    floorType: $floorType
    barrelNumber: $barrelNumber
    valve: $valve
    interval: $interval
    intervalValue: $intervalValue
    wagonCapacity: $wagonCapacity
    liftWagonCapacity: $liftWagonCapacity
    liftWagonCapacityValue: $liftWagonCapacityValue
    running: $running
    runningValue: $runningValue
    wagonLength: $wagonLength
    wagonWidth: $wagonWidth
    wagonCapacityValue: $wagonCapacityValue
    porchekHeight: $porchekHeight
    volume: $volume
    capacityL: $capacityL
    barrel1: $barrel1
    barrel2: $barrel2
    barrel3: $barrel3
    barrel4: $barrel4
    barrel5: $barrel5
    barrel6: $barrel6
    barrel7: $barrel7
    barrel8: $barrel8
    forceCapacityValue: $forceCapacityValue
    forceValue: $forceValue
    attachments: $attachments
    frontAttachments: $frontAttachments
    leftAttachments: $leftAttachments
    rightAttachments: $rightAttachments
    backAttachments: $backAttachments
    floorAttachments: $floorAttachments
    transformationAttachments: $transformationAttachments
  ) {
    _id
    createdAt
    modifiedAt
    owner {
      _id
      details {
        fullName
        __typename
      }
      email
      __typename
    }
    mergedIds
    description
    plateNumber
    vinNumber
    carCategoryId
    category {
      _id
      name
      order
      code
      parentId
      description
      collapseContent
      icon
      isRoot
      __typename
    }
    parentCategory {
      _id
      name
      order
      code
      parentId
      description
      collapseContent
      icon
      isRoot
      __typename
    }
    customers {
      _id
      firstName
      lastName
      primaryEmail
      primaryPhone
      __typename
    }
    companies {
      _id
      primaryName
      website
      __typename
    }
    color
    fuelType
    engineChange
    valve
    vintageYear
    importYear
    taxDate
    barrelWarranty
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
    __typename
  }
}`;
export default {
  add,
  remove,
  edit,
  carsEdit
};
