import tumentechQuery from './tumentech';
import participantsQuery from './participants';
import directionsQuery from './directions';
import routesQuery from './routes';
import placesQuery from './places';
import tripsQuery from './trips';

export default {
  ...tumentechQuery,
  ...participantsQuery,
  ...directionsQuery,
  ...routesQuery,
  ...placesQuery,
  ...tripsQuery
};
