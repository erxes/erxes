import { commonDefs, commonVariables } from "../../common/graphq";
import { lotteryFields } from "./queries";

const lotteriesAdd = `
mutation lotteriesAdd(${commonDefs}, $status: String) {
  lotteriesAdd(${commonVariables}, status: $status) {
    ${lotteryFields}
  }
}
`;

const lotteriesEdit = `
mutation lotteriesEdit($_id: String!, ${commonDefs}, $status: String) {
  lotteriesEdit(_id: $_id, ${commonVariables}, status: $status) {
    ${lotteryFields}
  }
}
`;

const lotteriesRemove = `
mutation lotteriesRemove($_ids: [String]) {
  lotteriesRemove(_ids: $_ids)
}
`;

export default {
  lotteriesAdd,
  lotteriesEdit,
  lotteriesRemove,
}