import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const item = {
  async itinerary(touritem: any, _args, { models }: IContext) {
    return await models.Itineraries.findById(touritem.itineraryId);
  },
  async orders(touritem: any, _args, { models }: IContext) {
    return await models.Orders.find({ tourId: touritem?._id });
  },
  categoryIds(touritem: any) {
    if (touritem.categoryIds?.length) {
      return touritem.categoryIds;
    }

    if (touritem.tagIds?.length) {
      return touritem.tagIds;
    }

    if (touritem.categoryId) {
      return [touritem.categoryId];
    }

    if (touritem.categories?.length) {
      return touritem.categories;
    }

    return [];
  },
  tagIds(touritem: any) {
    if (touritem.tagIds?.length) {
      return touritem.tagIds;
    }

    if (touritem.categoryIds?.length) {
      return touritem.categoryIds;
    }

    return [];
  },
  async categoriesObject(touritem: any, _args, { models }: IContext) {
    const ids =
      touritem.categoryIds ||
      touritem.categories ||
      touritem.tagIds ||
      (touritem.categoryId ? [touritem.categoryId] : []);

    return await models.BmsTourCategories.find({
      _id: { $in: ids },
    });
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
