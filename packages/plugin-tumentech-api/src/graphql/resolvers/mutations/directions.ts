import {
  IDirection,
  IDirectionDocument
} from '../../../models/definitions/directions';
import { IContext } from '../../../connectionResolver';

interface IDirectionEdit extends IDirection {
  _id: string;
}

const directionMutations = {
  directionsAdd: async (_root, doc: IDirection, { models }: IContext) => {
    console.log(doc);
    return models.Directions.create(doc);
  }
};

export default directionMutations;
