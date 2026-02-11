import { categoryQueries } from './category';
import { configQueries } from './config';
import { productQueries as productMainQueries } from './product';
import { productRuleQueries } from './rule';
import { uomQueries } from './uoms';

export const productQueries = {
  ...categoryQueries,
  ...configQueries,
  ...uomQueries,
  ...productMainQueries,
  ...productRuleQueries,
};
