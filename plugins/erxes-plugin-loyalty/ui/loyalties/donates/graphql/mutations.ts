import { commonDefs, commonVariables } from "../../common/graphq";
import { donateFields } from "./queries";

const donatesAdd = `
mutation donatesAdd(${commonDefs}, $status: String) {
  donatesAdd(${commonVariables}, status: $status) {
    ${donateFields}
  }
}
`;

const donatesEdit = `
mutation donatesEdit($_id: String!, ${commonDefs}, $status: String) {
  donatesEdit(_id: $_id, ${commonVariables}, status: $status) {
    ${donateFields}
  }
}
`;

const donatesRemove = `
mutation donatesRemove($_ids: [String]) {
  donatesRemove(_ids: $_ids)
}
`;

export default {
  donatesAdd,
  donatesEdit,
  donatesRemove,
}