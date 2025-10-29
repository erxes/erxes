import { putResponseQueries } from './ebarimt';
import { productGroupQueries } from './productGroups';
import { productRuleQueries } from './productRules';

export const ebarimtQueries = {
  ...putResponseQueries,
  ...productGroupQueries,
  ...productRuleQueries,
};
