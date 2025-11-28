import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const item = {
  async itinerary(touritem: any, _args, { models }: IContext) {
    return await models.Itineraries.findById(touritem.itineraryId);
  },
  async orders(touritem: any, _args, { models }: IContext) {
    return await models.Orders.find({ tourId: touritem?._id });
  },
  async guides(touritem: any, _args, { models, subdomain }: IContext) {
    const users = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      action: 'find',
      input: {
        query: {
          _id: { $in: touritem?.guides?.map((x) => x?.guideId) || [] },
        },
      },
    });

    return touritem?.guides.map((x) => {
      const userOne = users.find((d) => d._id == x.guideId);
      return {
        guideId: x.guideId,
        type: x.type,
        guide: userOne,
      };
    });
  },
};

export default item;
