import directionsQuery from './directions';
import participantsQuery from './participants';
import placesQuery from './places';
import routesQuery from './routes';
import tripsQuery from './trips';
import tumentechQuery from './tumentech';

export default {
  ...tumentechQuery,
  ...participantsQuery,
  ...directionsQuery,
  ...routesQuery,
  ...placesQuery,
  ...tripsQuery
};
