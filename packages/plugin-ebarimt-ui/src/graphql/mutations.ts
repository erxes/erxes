// Settings

import { responseFields } from "./queries";

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const putResponseReturnBill = `
  mutation putResponseReturnBill($_id: String!) {
    putResponseReturnBill(_id: $_id) {
      ${responseFields}
    }
  }
`;


export default {
  updateConfigs,
  putResponseReturnBill
};
