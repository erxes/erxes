import Element from './element';
import Itinerary from './itinerary';
import Tour from './tour';
import Order from './order';
import Branch from './branch';
import CustomTourType from './customTourType';

export default {
  ...Element,
  ...Itinerary,
  ...Tour,
  ...Order,
  ...Branch,
  ...CustomTourType,
};
