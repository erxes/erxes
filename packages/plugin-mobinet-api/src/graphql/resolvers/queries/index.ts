import cityQueries from './cities';
import districQueries from './districts';
import quarterQueries from './quarters';
import buildingQueries from './buildings';

export default {
  ...cityQueries,
  ...districQueries,
  ...quarterQueries,
  ...buildingQueries
};
