import { IContext } from '../../connectionResolver';
import { IConfigDocument } from '../../models/definitions/configs';

export default {
  async slots(config: IConfigDocument, _args, { models }: IContext) {
    return await models.PosSlots.find({ posId: config.posId });
  },

  allowTypes(config: IConfigDocument, _args, {}: IContext) {
    if (!config.allowTypes || !config.allowTypes.length) {
      return ['eat', 'take', 'delivery'];
    }
    return config.allowTypes;
  }
};
