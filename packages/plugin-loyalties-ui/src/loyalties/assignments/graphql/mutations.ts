import { commonDefs, commonVariables } from '../../common/graphq';
import {
  commonFields,
  commonParamsDef,
  commonParamsValue
} from '../../common/graphq';

const assignmentsAdd = `
  mutation assignmentsAdd(${commonDefs}) {
    assignmentsAdd(${commonVariables}) {
      ${commonFields}
    }
  }
`;

const assignmentsEdit = `
  mutation assignmentsEdit($_id: String!, ${commonDefs}, $status: String) {
    assignmentsEdit(_id: $_id, ${commonVariables}, status: $status) {
      ${commonFields}
    }
  }
`;

const assignmentsRemove = `
  mutation assignmentsRemove($_ids: [String]) {
    assignmentsRemove(_ids: $_ids)
  }
`;

export default {
  assignmentsAdd,
  assignmentsEdit,
  assignmentsRemove
};
