import { safeRemainderItemFields } from './queries';

const safeRemainderSubmit = `
  mutation safeRemainderSubmit(
    $_id: String!
  ) {
    safeRemainderSubmit(
      _id: $_id
    )
  }
`;

const safeRemainderItemEdit = `
  mutation safeRemainderItemEdit(
    $_id: String,
    $status: String,
    $remainder: Float,
  ) {
    safeRemainderItemEdit(
      _id: $_id,
      status: $status,
      remainder: $remainder,
    ) {
      ${safeRemainderItemFields}
    }
  }
`;

const safeRemainderItemRemove = `
  mutation safeRemainderItemRemove(
    $_id: String
  ) {
    safeRemainderItemRemove(
      _id: $_id
    )
  }
`;

export default {
  safeRemainderSubmit,
  safeRemainderItemEdit,
  safeRemainderItemRemove
};
