import { IContext } from '~/connectionResolvers';

const elementItem = {
  async element(elementItem: any, _args, { models }: IContext) {
    return await models.Elements.findById(elementItem.elementId);
  },
};

export default elementItem;
