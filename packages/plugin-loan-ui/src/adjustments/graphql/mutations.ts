import { adjustmentDetailFields } from './queries';

const commonFields = `
  $date: Date,
`;

const commonVariables = `
  date: $date,
`;

const adjustmentsAdd = `
  mutation adjustmentsAdd(${commonFields}) {
    adjustmentsAdd(${commonVariables}) {
      _id
      ${adjustmentDetailFields}
    }
  }
`;

const adjustmentsEdit = `
  mutation adjustmentsEdit($_id: String!, ${commonFields}) {
    adjustmentsEdit(_id: $_id, ${commonVariables}) {
      _id
      ${adjustmentDetailFields}
    }
  }
`;

const adjustmentsRemove = `
  mutation adjustmentsRemove($adjustmentIds: [String]) {
    adjustmentsRemove(adjustmentIds: $adjustmentIds)
  }
`;

export default {
  adjustmentsAdd,
  adjustmentsEdit,
  adjustmentsRemove
};
