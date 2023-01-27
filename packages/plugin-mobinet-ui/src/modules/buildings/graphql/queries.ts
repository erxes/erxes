const commonfields = `
_id
bounds
location
code
serviceStatus
color
description
name
osmbId
quarter {
  _id
  name
  district {
    _id
    name
    city {
      _id
      name
    }
  }
}
quarterId
type
`;

const commonParamsDef = `
$cityId: String
$customerIds: [String]
$districtId: String
$osmbId: String
$page: Int
$perPage: Int
$quarterId: String
$searchValue: String
$type: String
$customQuery: JSON
`;

const commonParams = `
cityId: $cityId
customerIds: $customerIds
districtId: $districtId
osmbId: $osmbId
page: $page
perPage: $perPage
quarterId: $quarterId
searchValue: $searchValue
type: $type
customQuery: $customQuery
`;

const listQuery = `
query BuildingList(${commonParamsDef}) {
    buildingList(${commonParams}) {
      list {
        ${commonfields}
      }
        totalCount
    }
  }
`;

const buildingsQuery = `
query Buildings(${commonParamsDef}) {
    buildings(${commonParams}) {
        ${commonfields}
    }
}
`;

const detailQuery = `
query BuildingDetail($_id: String!) {
    buildingDetail(_id: $_id) {
        ${commonfields}
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
          primaryEmail
          primaryPhone
        }
    }
}
`;

const buildingsByBoundsQuery = `
query BuildingsByBounds($bounds: JSON, $serviceStatuses: [ServiceStatus]) {
  buildingsByBounds(bounds: $bounds, serviceStatuses: $serviceStatuses) {
    _id
    serviceStatus
    color
    osmbId
  }
}
`;

export default {
  listQuery,
  detailQuery,
  buildingsByBoundsQuery,
  buildingsQuery
};
