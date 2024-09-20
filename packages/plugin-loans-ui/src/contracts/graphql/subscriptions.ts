import { contractFields } from "./queries";

const loansContractChanged = `
  subscription loansContractChanged($ids: [String]) {
    loansContractChanged(ids: $ids) {
      ${contractFields}
    }
  }
`;

const loansSchedulesChanged = `
  subscription loansSchedulesChanged($contractId: String!) {
    loansSchedulesChanged(contractId: $contractId) {
      _id
    }
  }
`;

export default {
  loansContractChanged,
  loansSchedulesChanged
};
