import Element from './element';
import Itinerary from './itinerary';
import ItineraryPdfTemplate from './itineraryPdfTemplate';
import Tour from './tour';
import Order from './order';
import Branch from './branch';

export default {
  ...Element,
  ...Itinerary,
  ...ItineraryPdfTemplate,
  ...Tour,
  ...Order,
  ...Branch,
};
