import riskQueries from './risks';
import productQueries from './products';
import packageQueries from './packages';
import categoryQueries from './categories';
import itemQueries from './items';

export default {
  ...itemQueries,
  ...riskQueries,
  ...productQueries,
  ...packageQueries,
  ...categoryQueries
};
