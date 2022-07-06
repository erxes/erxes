import { IContext } from '../../connectionResolver';
import { IDirectionDocument } from './../../models/definitions/directions';

const Direction = {
  async places(
    direction: IDirectionDocument,
    _params,
    { models: { Places } }: IContext
  ) {
    const places = await Places.find({
      _id: { $in: direction.placeIds || [] }
    }).lean();

    return places;
  }
};

export { Direction };
