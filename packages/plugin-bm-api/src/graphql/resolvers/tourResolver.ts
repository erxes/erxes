import { IContext } from '../../connectionResolver';

const item = {
  async itinerary(touritem: any, {}, { models, subdomain }: IContext) {
    return await models.Itineraries.findById(touritem.itineraryId);
  },
  async orders(touritem: any, {}, { models, subdomain }: IContext) {
    return await models.Orders.find({ tourId: touritem });
  },
};

export default item;
