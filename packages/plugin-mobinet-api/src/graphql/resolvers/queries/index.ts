import cityQueries from './cities';
import districQueries from './districts';
import quarterQueries from './quarters';
import buildingQueries from './buildings';
import contractQueries from './contracts';

export default {
  ...cityQueries,
  ...districQueries,
  ...quarterQueries,
  ...buildingQueries,
  ...contractQueries
};
