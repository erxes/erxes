export const collateralTypeEdit = `
  mutation collateralTypeEdit($id: String!, $code: String, $name: String, $description: String, $type: String, $startDate: Date, $status: String, $endDate: Date, $currency: String) {
    collateralTypeEdit(_id: $id, code: $code, name: $name, description: $description, type: $type, startDate: $startDate, status: $status, endDate: $endDate, currency: $currency) {
      code
      currency
      description
      endDate
      name
      startDate
      status
      type
    }
  }
`;

export const collateralTypeAdd = `
  mutation collateralTypeAdd($code: String, $name: String, $description: String, $type: String, $startDate: Date, $endDate: Date, $status: String, $currency: String) {
    collateralTypeAdd(code: $code, name: $name, description: $description, type: $type, startDate: $startDate, endDate: $endDate, status: $status, currency: $currency) {
      code
      currency
      description
      endDate
      name
      startDate
      status
      type
    }
  }
`;

export const collateralTypeRemove = `
  mutation collateralTypeRemove($id: String!) {
    collateralTypeRemove(_id: $id) {
      _id
    }
  }
`

export default {
  collateralTypeEdit,
  collateralTypeAdd,
  collateralTypeRemove
};
