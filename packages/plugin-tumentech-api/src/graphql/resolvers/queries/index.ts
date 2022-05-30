import tumentechQuery from './tumentech';
import participantsQuery from './participants';
import directionsQuery from './directions';
import routesQuery from './routes';

export default {
  ...tumentechQuery,
  ...participantsQuery,
  ...directionsQuery,
  ...routesQuery
};
