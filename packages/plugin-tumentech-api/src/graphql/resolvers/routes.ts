import { IContext } from '../../connectionResolver';
import { IRouteDocument } from './../../models/definitions/routes';

const Route = {
  async directions(
    route: IRouteDocument,
    _params,
    { models: { Directions } }: IContext
  ) {
    return Directions.aggregate([
      { $match: { _id: { $in: route.directionIds || [] } } },
      {
        $addFields: {
          __order: { $indexOfArray: [route.directionIds || [], '$_id'] }
        }
      },
      { $sort: { __order: 1 } }
    ]);
  },

  async summary(
    route: IRouteDocument,
    _params,
    { models: { Directions, Places } }: IContext
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
          },
          placeIds: { $push: '$placeIds' }
        }
      },
      {
        $project: {
          distance: '$distance',
          duration: '$duration',

          placeIds: {
            $reduce: {
              input: '$placeIds',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] }
            }
          }
        }
      }
    ]);

    if (!result || !result.length) {
      return null;
    }

    const obj: any = result[0];

    const placeNames = await Places.find({
      _id: { $in: obj.placeIds }
    }).distinct('name');

    return {
      totalDistance: obj.distance,
      totalDuration: obj.duration,
      placeNames: placeNames.toString()
    };
  }
};

export { Route };
