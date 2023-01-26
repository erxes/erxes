import importHistory from './importHistory';
import exportHistory from './exportHistory';
import generalHistory from './generalHistory';

export default {
  ...importHistory,
  ...exportHistory,
  ...generalHistory
};
