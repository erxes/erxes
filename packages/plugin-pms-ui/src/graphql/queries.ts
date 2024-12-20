// Settings

import { isEnabled } from '@erxes/ui/src/utils/core';

const configs = `
  query pmsConfigsGetValue($code: String!) {
    pmsConfigsGetValue(code: $code)
  }
`;

export default {
  configs,
};
