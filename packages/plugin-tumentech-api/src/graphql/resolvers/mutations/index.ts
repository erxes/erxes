import tumentechMutations from './tumentech';
import tumentechMatchMutations from './carCategoryProduct';
import participantMutations from './participants';
import directionMutations from './directions';
import routeMutations from './routes';

export default {
  ...tumentechMutations,
  ...tumentechMatchMutations,
  ...participantMutations,
  ...directionMutations,
  ...routeMutations
};
