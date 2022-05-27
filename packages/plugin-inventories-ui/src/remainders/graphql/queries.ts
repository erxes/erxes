const remainderFields = `
  _id
  modifiedAt
  productId
  quantity
  uomId
  count
  branchId
  departmentId
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
`;

const remainders = `
  query remainders(${listParamsDef}) {
    remainders(${listParamsValue}) {
      ${remainderFields}
    }
  }
`;

const remainderDetail = `
  query remainderDetail($_id: String) {
    remainderDetail(_id: $_id) {
      ${remainderFields}
    }
  }
`;

const getRemainder = `
  query getRemainder($productId: String, $departmentId: String, $branchId: String, $uomId: String) {
    getRemainder(productId: $productId, departmentId: $departmentId, branchId: $branchId, uomId: $uomId){
      _id
      remainder
      uomId

      uom

    }
  }
`;

export default {
  remainders,
  remainderDetail,
  getRemainder
};
