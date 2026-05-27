import Element from './element';
import Itinerary from './itinerary';
import Tour from './tour';
import Branch from './branch';
import Order from './order';
import cpBranch from './cpBranch';

export default {
  ...Element,
  ...Itinerary,
  ...Tour,
  ...Branch,
  ...Order,
  ...cpBranch,
};
