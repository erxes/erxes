import cityQueries from './cities';
import districQueries from './districts';
import quarterQueries from './quarters';
import buildingQueries from './buildings';
import contractQueries from './contracts';
import productQueries from './mobinetProducts';

export default {
  ...cityQueries,
  ...districQueries,
  ...quarterQueries,
  ...buildingQueries,
  ...contractQueries,
  ...productQueries
};
