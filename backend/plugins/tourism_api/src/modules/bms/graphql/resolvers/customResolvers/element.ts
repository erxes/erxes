import { IElement } from '@/bms/@types/element';
import { IContext } from '~/connectionResolvers';
 
const element = {
  async categoriesObject(element: IElement, _args, { models }: IContext) {
    return models.ElementCategories.find({
      _id: { $in: element.categories || [] },
    });
  },
 
  async translations(element: any, _args, { models }: IContext) {
    return models.ElementTranslations.find({
      objectId: element._id,
    }).lean();
  },
};
 
export default element;
 