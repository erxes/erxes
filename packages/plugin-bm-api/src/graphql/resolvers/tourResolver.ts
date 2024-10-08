import { IContext } from '../../connectionResolver';

const item = {
  async itinerary(touritem: any, {}, { models, subdomain }: IContext) {
    return await models.Itineraries.findById(touritem.itineraryId);
  },
};

export default item;
