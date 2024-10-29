import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const item = {
  async itinerary(touritem: any, {}, { models, subdomain }: IContext) {
    return await models.Itineraries.findById(touritem.itineraryId);
  },
  async orders(touritem: any, {}, { models, subdomain }: IContext) {
    return await models.Orders.find({ tourId: touritem?._id });
  },
  async guides(touritem: any, {}, { models, subdomain }: IContext) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: touritem?.guidesIds },
        },
      },
      isRPC: true,
    });
    return users;
  },
};

export default item;
