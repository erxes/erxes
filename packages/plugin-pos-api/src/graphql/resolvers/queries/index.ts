import Pos from './pos';
import Order from './orders';
import Payment from './payments';
import Product from './products';

export default { ...Pos, ...Order, ...Payment, ...Product };
