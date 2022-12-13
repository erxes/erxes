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
  }
}
`;

export default {
  listQuery,
  detailQuery,
  districtsQuery
};
