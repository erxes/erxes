import { IElement } from '@/bms/@types/element';
import { IContext } from '~/connectionResolvers';

const element = {
  async categoriesObject(element: IElement, _args, { models }: IContext) {
    return await models.ElementCategories.find({
      _id: { $in: element.categories || [] },
    });
  },
};

export default element;
