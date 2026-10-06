import { categoryQueries } from './category';
import { configQueries } from './config';
import { packageQueries } from './package';
import { productQueries as productMainQueries } from './product';
import { productRuleQueries } from './rule';
import { productConditionGroupQueries } from './conditionGroup';
import { productSimilarityQueries } from './similarity';
import { uomQueries } from './uoms';

export const productQueries = {
  ...categoryQueries,
  ...configQueries,
  ...uomQueries,
  ...productMainQueries,
  ...productRuleQueries,
  ...productConditionGroupQueries,
  ...productSimilarityQueries,
  ...packageQueries,
};
