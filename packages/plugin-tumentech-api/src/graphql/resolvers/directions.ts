import { IContext } from '../../connectionResolver';
import { IDirectionDocument } from './../../models/definitions/directions';

const Direction = {
  async places(
    direction: IDirectionDocument,
    _params,
    { models: { Places } }: IContext
  ) {
    const places = await Places.find({
      _id: { $in: (direction.placeIds || []).filter(id => id) }
    }).limit(10);
    return places;
  }
};

export { Direction };
