import Order from './orders';
import Configs from './configs';
import PosUser from './posUsers';
import Cover from './covers';
import Bridges from './bridges';

export default { ...Order, ...Configs, ...PosUser, ...Cover, ...Bridges };
