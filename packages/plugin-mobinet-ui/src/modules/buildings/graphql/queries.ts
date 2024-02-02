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
suhId
quarter {
  _id
  name
  districtId
  district {
    _id
    name
    cityId
    city {
      _id
      name
    }
  }
}
quarterId
type
networkType
customFieldsData
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
$networkType: NetworkType 
$serviceStatus: ServiceStatus
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
networkType: $networkType
serviceStatus:$serviceStatus
`;

const listQuery = `
query BuildingList(${commonParamsDef}) {
    buildingList(${commonParams}) {
      list {
        ${commonfields}
        installationRequestIds
        ticketIds
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

        suh {
          _id
          primaryName
          primaryEmail
          primaryPhone
        }

        productPriceConfigs {
          productId
          price
          product {
            _id
            name
          }
        }

        installationRequestIds
        ticketIds
        assetIds

        installationRequests {
          _id
          name
          description
          createdAt
        }

        tickets {
          _id
          name
          description
          createdAt
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

const assets = `
  query assets {
    assets {
      _id
      name
    }
  }
`;

const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

export default {
  listQuery,
  detailQuery,
  buildingsByBoundsQuery,
  buildingsQuery,
  assets,
  configs,
};
