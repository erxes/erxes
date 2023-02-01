import tumentechMatchMutations from './carCategoryProduct';
import directionMutations from './directions';
import participantMutations from './participants';
import placeMutations from './places';
import routeMutations from './routes';
import tripMutations from './trips';
import tumentechMutations from './tumentech';
import topupMutations from './topup';

export default {
  ...tumentechMutations,
  ...tumentechMatchMutations,
  ...participantMutations,
  ...directionMutations,
  ...routeMutations,
  ...placeMutations,
  ...tripMutations,
  ...topupMutations
};
