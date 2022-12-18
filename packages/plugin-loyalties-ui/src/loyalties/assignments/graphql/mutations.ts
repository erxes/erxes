import { commonDefs, commonVariables } from '../../common/graphq';
import { commonFields } from '../../common/graphq';

const assignmentsAdd = `
  mutation assignmentsAdd(${commonDefs}, $segmentIds: [String]) {
    assignmentsAdd(${commonVariables}, segmentIds: $segmentIds) {
      ${commonFields},
      segmentIds
    }
  }
`;

const assignmentsEdit = `
  mutation assignmentsEdit($_id: String!, ${commonDefs}, $status: String, $segmentIds: [String]) {
    assignmentsEdit(_id: $_id, ${commonVariables}, status: $status, segmentIds: $segmentIds) {
      ${commonFields},
      segmentIds
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
