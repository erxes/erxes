import { IContext } from '~/connectionResolvers';
import { IItineraryDocument } from '@/bms/@types/itinerary';

const item = {
  async tours(itinerary: IItineraryDocument, _args, { models }: IContext) {
    return await models.Tours.find({ itineraryId: itinerary._id });
  },
};

export default item;
