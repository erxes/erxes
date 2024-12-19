import { IContext } from '../../connectionResolver';
import { IElement } from '../../models/definitions/element';

const element = {
  async categoriesObject(
    element: IElement,
    {},
    { models, subdomain }: IContext
  ) {
    return await models.ElementCategories.find({
      _id: { $in: element.categories || [] },
    });
  },
};

export default element;
