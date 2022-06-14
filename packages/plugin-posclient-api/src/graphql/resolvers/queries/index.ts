import Orders from './orders';
import Payment from './payments';
import Products from './products';

export default { ...Orders, ...Payment, ...Products };
