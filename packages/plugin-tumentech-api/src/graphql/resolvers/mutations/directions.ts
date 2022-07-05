import { IDirection } from '../../../models/definitions/directions';
import { IContext } from '../../../connectionResolver';

export interface IDirectionEdit extends IDirection {
  _id: string;
}

const directionMutations = {
  directionsAdd: async (
    _root,
    doc: IDirection,
    { subdomain, models }: IContext
  ) => {
    return models.Directions.createDirection(subdomain, doc);
  },

  directionsEdit: async (
    _root,
    doc: IDirectionEdit,
    { subdomain, models }: IContext
  ) => {
    await models.Directions.updateDirection(subdomain, doc);

    return models.Directions.getDirection({ _id: doc._id });
  },

  directionsRemove: (_root, { _id }, { models }: IContext) => {
    return models.Directions.remove({ _id });
  }
};

export default directionMutations;
