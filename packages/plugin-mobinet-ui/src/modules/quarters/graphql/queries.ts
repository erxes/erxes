const fields = `
_id
center
code
district {
  _id
  city {
    _id
    name
  }
  name
}
districtId
name
`;

const listQuery = `
query QuarterList($cityId: String, $districtId: String, $page: Int, $perPage: Int, $searchValue: String) {
    quarterList(cityId: $cityId, districtId: $districtId, page: $page, perPage: $perPage, searchValue: $searchValue) {
      list {
        ${fields}
      }
        totalCount
    }
  }
`;

const detailQuery = `
query QuarterDetail($_id: String!) {
    quarterDetail(_id: $_id) {
        ${fields}
    }
}
`;

export default {
  listQuery,
  detailQuery
};
