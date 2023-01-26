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

const listQuery = `
query BuildingList($cityId: String, $customerIds: [String], $districtId: String, $osmbId: String, $page: Int, $perPage: Int, $quarterId: String, $searchValue: String, $type: String) {
    buildingList(cityId: $cityId, customerIds: $customerIds, districtId: $districtId, osmbId: $osmbId, page: $page, perPage: $perPage, quarterId: $quarterId, searchValue: $searchValue, type: $type) {
      list {
        ${commonfields}
      }
        totalCount
    }
  }
`;

const detailQuery = `
query BuildingDetail($_id: String!) {
    buildingDetail(_id: $_id) {
        ${commonfields}
        customerIds
        customers {
          _id
          firstName
          lastName
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
  buildingsByBoundsQuery
};
