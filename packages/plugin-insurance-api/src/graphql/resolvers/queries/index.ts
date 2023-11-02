import riskQueries from './risks';
import productQueries from './products';
import packageQueries from './packages';
import categoryQueries from './categories';

export default {
  ...riskQueries,
  ...productQueries,
  ...packageQueries,
  ...categoryQueries
};
