import cityMutations from './cities';
import districtMutations from './districts';
import quarterMutations from './quarters';
import buildingMutations from './buildings';
import contractMutations from './contracts';

export default {
  ...cityMutations,
  ...districtMutations,
  ...quarterMutations,
  ...buildingMutations,
  ...contractMutations
};
