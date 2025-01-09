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
          _id: { $in: touritem?.guides?.map(x => x?.guideId) || [] },
        },
      },
      isRPC: true,
    });
    return touritem?.guides.map(x => {
      const userOne = users.find(d => d._id == x.guideId);
      return {
        guideId: x.guideId,
        type: x.type,
        guide: userOne,
      };
    });
  },
};

export default item;
