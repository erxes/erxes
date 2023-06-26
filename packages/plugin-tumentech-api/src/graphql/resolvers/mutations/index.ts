import tumentechMatchMutations from './carCategoryProduct';
import directionMutations from './directions';
import participantMutations from './participants';
import placeMutations from './places';
import routeMutations from './routes';
import tripMutations from './trips';
import tumentechDealMutations from './tumentechDeal';
import tumentechMutations from './tumentech';
import accountMutations from './accounts';

export default {
  ...tumentechMutations,
  ...tumentechMatchMutations,
  ...participantMutations,
  ...directionMutations,
  ...routeMutations,
  ...placeMutations,
  ...tripMutations,
  ...tumentechDealMutations,
  ...accountMutations
};
