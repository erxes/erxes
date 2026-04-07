import { IContext } from '~/connectionResolvers';
import { IItineraryDocument } from '@/bms/@types/itinerary';

const item = {
  async tours(itinerary: IItineraryDocument, _args, { models }: IContext) {
    return models.Tours.find({ itineraryId: itinerary._id });
  },

  async translations(itinerary: any, _args, { models }: IContext) {
    return models.ItineraryTranslations.find({
      objectId: itinerary._id,
    }).lean();
  },
};

export default item;
