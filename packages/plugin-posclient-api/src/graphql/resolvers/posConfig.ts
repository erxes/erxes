import { IContext } from '../../connectionResolver';
import { IConfigDocument } from '../../models/definitions/configs';

export default {
  async slots(config: IConfigDocument, _args, { models }: IContext) {
    return await models.PosSlots.find({ posId: config.posId });
  }
};
