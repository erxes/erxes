import { IMovementDocument } from '../../common/types/asset';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Assets.findOne({ _id });
  },

  async user(movement: IMovementDocument, {}, { dataLoaders }: IContext) {
    return (
      (movement.userId && dataLoaders.teamMember.load(movement.userId)) || null
    );
  },

  async items(movement: IMovementDocument, {}, { models }: IContext) {
    return await models.MovementItems.find({ movementId: movement._id });
  }
};
