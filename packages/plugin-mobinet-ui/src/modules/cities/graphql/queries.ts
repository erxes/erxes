const fields = `
    _id
    geoData
    code
    createdAt
    iso
    name
    stat
    updatedAt
`;

const listQuery = `
query cityList($page: Int, $perPage: Int, $searchValue: String) {
  cityList(page: $page, perPage: $perPage, searchValue: $searchValue) {
    list {
      ${fields}
    }
    totalCount
  }
}
`;

const detailQuery = `
query CityDetail($id: String!) {
  cityDetail(_id: $id) {
    ${fields}
  }
}
`;

const citiesQuery = `
query Cities($searchValue: String) {
    cities(searchValue: $searchValue) {
      _id
      name
    }
  }
`;

export default {
  listQuery,
  detailQuery,
  citiesQuery
};
