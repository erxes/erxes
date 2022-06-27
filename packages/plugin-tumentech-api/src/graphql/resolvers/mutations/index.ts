import tumentechMutations from './tumentech';
import tumentechMatchMutations from './carCategoryProduct';
import participantMutations from './participants';
import directionMutations from './directions';
import routeMutations from './routes';
import placeMutations from './places';
import tripMutations from './trips';

export default {
  ...tumentechMutations,
  ...tumentechMatchMutations,
  ...participantMutations,
  ...directionMutations,
  ...routeMutations,
  ...placeMutations,
  ...tripMutations
};
