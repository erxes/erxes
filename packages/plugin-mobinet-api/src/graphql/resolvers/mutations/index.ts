import cityMutations from './cities';
import districtMutations from './districts';
import quarterMutations from './quarters';
import buildingMutations from './buildings';

export default {
  ...cityMutations,
  ...districtMutations,
  ...quarterMutations,
  ...buildingMutations
};
