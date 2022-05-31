import { IRouteDocument } from './../../models/definitions/routes';
import { IContext } from '../../connectionResolver';

const Route = {
  async directions(
    route: IRouteDocument,
    _params,
    { models: { Directions } }: IContext
  ) {
    return Directions.find({
      _id: { $in: (route.directionIds || []).filter(id => id) }
    }).limit(10);
  },

  async summary(
    route: IRouteDocument,
    _params,
    { models: { Directions } }: IContext
  ) {
    const result: any = await Directions.aggregate([
      { $match: { _id: { $in: route.directionIds } } },
      {
        $group: {
          _id: null,
          distance: {
            $sum: '$totalDistance'
          },
          duration: {
            $sum: '$duration'
          }
        }
      }
    ]);

    if (!result) {
      return null;
    }

    const obj: any = result[0];

    return {
      totalDistance: obj.distance,
      totalDuration: obj.duration,
      roadCodes: '[String]',
      places: ''
    };
  }
};

export { Route };
