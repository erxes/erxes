import Pos from './pos';
import Order from './orders';
import Payment from './payments';
import PosUsers from './posUsers';

export default { ...Pos, ...Order, ...Payment, ...PosUsers };
