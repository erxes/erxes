import { IContext } from "../../connectionResolver";
import { sendCoreMessage } from "../../messageBroker";
import {
  IItinerary,
  IItineraryDocument,
} from "../../models/definitions/itinerary";

const item = {
  async tours(
    itinerary: IItineraryDocument,
    {},
    { models, subdomain }: IContext
  ) {
    return await models.Tours.find({ itineraryId: itinerary._id });
  },
};

export default item;
