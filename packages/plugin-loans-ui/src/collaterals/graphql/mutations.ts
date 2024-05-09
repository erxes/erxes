const commonFields = `
  $code: String,
  $name: String,
  $description: String,
  $type: String,
  $startDate: Date,
  $status: String,
  $endDate: Date,
  $currency: String,
  $config: JSON, 
  $property: JSON
`;

const commonVariables = `
  code: $code,
  name: $name,
  description: $description,
  type: $type,
  startDate: $startDate,
  status: $status,
  endDate: $endDate,
  currency: $currency,
  config: $config, 
  property: $property
`;


export const collateralTypeEdit = `
  mutation collateralTypeEdit($id: String!, ${commonFields}) {
    collateralTypeEdit(_id: $id, ${commonVariables}) {
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
  mutation collateralTypeAdd(${commonFields}) {
    collateralTypeAdd(${commonVariables}) {
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
