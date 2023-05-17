import { sendRequest } from '@erxes/api-utils/src';
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

  // async googleMapPath(
  //   direction: IDirectionDocument,
  //   _params,
  //   { models: { Places } }: IContext
  // ) {
  //   const { placeIds } = direction;

  //   const places = await Places.find({
  //     _id: { $in: placeIds || [] },
  //   }).lean();

  //   if (places.length < 2) {
  //     return '';
  //   }

  //   const lat1 = places[0].center.lat;
  //   const lng1 = places[0].center.lng;

  //   const lat2 = places[1].center.lat;
  //   const lng2 = places[1].center.lng;

  //   const res = await sendRequest({
  //     url: `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}`,
  //     method: 'GET',
  //   });

  //   const { code, routes } = res;

  //   if (code === 'Ok' && routes.length > 0) {
  //     return routes[0].geometry;
  //   }

  //   return '';
  // },
};

export { Direction };
