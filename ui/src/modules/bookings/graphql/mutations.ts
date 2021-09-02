const bookingMutationParamsDef = `
  $name: String!
  $size: String
`;

const bookingMutationParamsVal = `
  name: $name
  size: $size
`;

const bookingsAdd = `
  mutation bookingsAdd(${bookingMutationParamsDef}) {
    bookingsAdd(${bookingMutationParamsVal}) {
      _id
    }
  }
`;

const bookingsEdit = `
  mutation bookingsEdit(_id: String!, ${bookingMutationParamsDef}) {
    bookingsEdit(_id: $_id, ${bookingMutationParamsVal}) {
      _id
    }
  }
`;

const bookingsRemove = `
  mutation bookingsRemove($_id: String!) {
    bookingsRemove(_id: $_id)
  }
`;

export default {
  bookingsAdd,
  bookingsRemove,
  bookingsEdit
};
