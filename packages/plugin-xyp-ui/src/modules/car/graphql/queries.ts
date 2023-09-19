const list = `
  query listQuery {
    xypDataList {
      _id
      contentType
      contentTypeId
      data
    }
  }
`;
const serviceChoosen = `
  query xypServiceListChoosen {
    xypServiceListChoosen
  }
`;
const detail = `
query xypDataDetail($id: String, $contentType: String, $contentTypeId: String) {
  xypDataDetail(_id: $id, contentType: $contentType, contentTypeId: $contentTypeId) {
    _id
    contentType
    contentTypeId
    createdAt
    data
    updatedAt
  }
}`;
const carDetail = `
query carDetail($_id: String!) {
  carDetail(_id: $_id) {
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
    attachments {
      name
      url
      type
      size
      __typename
    }
    frontAttachments {
      name
      url
      type
      size
      __typename
    }
    leftAttachments {
      name
      url
      type
      size
      __typename
    }
    rightAttachments {
      name
      url
      type
      size
      __typename
    }
    backAttachments {
      name
      url
      type
      size
      __typename
    }
    floorAttachments {
      name
      url
      type
      size
      __typename
    }
    transformationAttachments {
      name
      url
      type
      size
      __typename
    }
    __typename
  }
}`;
const totalCount = `
  query xypsTotalCount{
    xypsTotalCount
  }
`;
const xypRequest = `
query xypRequest($params: JSON, $wsOperationName: String!) {
  xypRequest(params: $params, wsOperationName: $wsOperationName)
}
`;
const xypServiceList = `
query xypServiceListAll {
  xypServiceList
}`;

export default {
  detail,
  carDetail,
  xypRequest,
  list,
  totalCount,
  serviceChoosen,
  xypServiceList
};
