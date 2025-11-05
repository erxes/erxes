import { IContext } from '~/connectionResolvers';
import { ICarDocument } from '~/modules/cars/@types/car';

export default {
  category: async (car: ICarDocument, _args: any, { models }: IContext) => {
    return models.CarCategories.findOne({ _id: car.categoryId });
  },

  customer: async (car: ICarDocument) => {
    if (!car?.ownerId) {
      return null;
    }

    return { __typename: 'Customer', _id: car.ownerId };
  },

  tags(car: ICarDocument) {
    if (!car.tagIds?.length) {
      return [];
    }

    return car.tagIds.map((_id) => ({ __typename: 'Tag', _id }));
  },
};
