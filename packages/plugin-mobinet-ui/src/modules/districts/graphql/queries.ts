const fields = `
_id
center
code
city {
  createdAt
  _id
  name
}
cityId
createdAt
name
updatedAt
isCapital
`;

const listQuery = `
query DistrictList($cityId: String, $page: Int, $perPage: Int, $searchValue: String) {
    districtList(cityId: $cityId, page: $page, perPage: $perPage, searchValue: $searchValue) {
      list {
        ${fields}
      }
      totalCount
    }
  }
`;

const detailQuery = `
query DistrictDetail($_id: String!) {
    districtDetail(_id: $_id) {
        ${fields}
        }
    }
`;

const districtsQuery = `
query Districts($cityId: String, $page: Int, $perPage: Int, $searchValue: String) {
  districts(cityId: $cityId page: $page perPage: $perPage searchValue: $searchValue) {
    _id
    name
    center
  }
}
`;

const districtByCoordinatesQuery = `
query districtByCoordinates($lat: Float!, $lng: Float!) {
  districtByCoordinates(lat: $lat, lng: $lng) {
    _id
    name
    center
  }
}
`;

export default {
  listQuery,
  detailQuery,
  districtsQuery,
  districtByCoordinatesQuery
};
