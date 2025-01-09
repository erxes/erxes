import { IContext } from '../../connectionResolver';

const elementItem = {
  async element(elementItem: any, {}, { models, subdomain }: IContext) {
    return await models.Elements.findById(elementItem.elementId);
  },
};

export default elementItem;
