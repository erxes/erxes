import { commonDefs, commonVariables } from '../../common/graphq';
import { spinFields } from './queries';

const spinsAdd = `
  mutation spinsAdd(${commonDefs}, $status: String) {
    spinsAdd(${commonVariables}, status: $status) {
      ${spinFields}
    }
  }
`;

const spinsEdit = `
  mutation spinsEdit($_id: String!, ${commonDefs}, $status: String) {
    spinsEdit(_id: $_id, ${commonVariables}, status: $status) {
      ${spinFields}
    }
  }
`;

const spinsRemove = `
  mutation spinsRemove($_ids: [String]) {
    spinsRemove(_ids: $_ids)
  }
`;

export default {
  spinsAdd,
  spinsEdit,
  spinsRemove
};
