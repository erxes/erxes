const fields = `
    _id
    center
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
      center
    }
  }
`;

const cityByCoordinatesQuery = `
query CityByCoordinates($lat: Float!, $lng: Float!) {
  cityByCoordinates(lat: $lat, lng: $lng) {
    _id
    name
  }
}
`;

export default {
  listQuery,
  detailQuery,
  citiesQuery,
  cityByCoordinatesQuery
};
