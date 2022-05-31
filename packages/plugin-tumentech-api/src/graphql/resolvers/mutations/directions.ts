import { IDirection } from '../../../models/definitions/directions';
import { IContext } from '../../../connectionResolver';

export interface IDirectionEdit extends IDirection {
  _id: string;
}

const directionMutations = {
  directionsAdd: async (_root, doc: IDirection, { models }: IContext) => {
    return models.Directions.createDirection(doc);
  },

  directionsEdit: async (_root, doc: IDirectionEdit, { models }: IContext) => {
    return models.Directions.updateDirection(doc);
  },

  directionsRemove: (_root, { _id }, { models }: IContext) => {
    return models.Directions.remove({ _id });
  }
};

export default directionMutations;
