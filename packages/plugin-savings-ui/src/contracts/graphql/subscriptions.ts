import { contractFields } from "./queries";

const savingsContractChanged = `
  subscription savingsContractChanged($ids: [String]) {
    savingsContractChanged(ids: $ids) {
      ${contractFields}
    }
  }
`;

export default {
  savingsContractChanged
};