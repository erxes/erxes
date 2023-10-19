import { periodLockDetailFields } from './queries';

const commonFields = `
  $date: Date,
  $excludeContracts: [String]
`;

const commonVariables = `
  date: $date,
  excludeContracts:$excludeContracts
`;

const periodLocksAdd = `
  mutation savingsPeriodLocksAdd(${commonFields}) {
    savingsPeriodLocksAdd(${commonVariables}) {
      _id
      ${periodLockDetailFields}
    }
  }
`;

const periodLocksEdit = `
  mutation periodLocksEdit($_id: String!, ${commonFields}) {
    periodLocksEdit(_id: $_id, ${commonVariables}) {
      _id
      ${periodLockDetailFields}
    }
  }
`;

const periodLocksRemove = `
  mutation savingsPeriodLocksRemove($periodLockIds: [String]) {
    savingsPeriodLocksRemove(periodLockIds: $periodLockIds)
  }
`;

export default {
  periodLocksAdd,
  periodLocksEdit,
  periodLocksRemove
};
