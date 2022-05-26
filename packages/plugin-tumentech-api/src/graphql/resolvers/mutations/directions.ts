import {
  IDirection,
  IDirectionDocument
} from '../../../models/definitions/directions';
import { IContext } from '../../../connectionResolver';

interface IDirectionEdit extends IDirection {
  _id: string;
}

const directionMutations = {
  directionAdd: async (_root, doc: IDirection, { models }: IContext) => {
    return models.Directions.create(doc);
  }
};

export default directionMutations;
