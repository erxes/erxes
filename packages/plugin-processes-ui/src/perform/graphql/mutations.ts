const performsParamsDef = `$startAt: Date, $endAt: Date, $dueDate: Date, $overallWorkId: String, $status: String, $count: String, $needProducts: [JobProductsInput], $resultProducts: [JobProductsInput]`;

const performsParams = `startAt: $startAt, endAt: $endAt, dueDate: $dueDate, overallWorkId: $overallWorkId, status: $status, count: $count, needProducts: $needProducts, resultProducts: $resultProducts`;

const performsAdd = `
mutation performsAdd(${performsParamsDef}) {
  performsAdd(${performsParams}) {
    _id
  }
}
`;

export default {
  performsAdd
};
