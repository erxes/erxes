import { IContext } from '../../connectionResolver';
import { IDistrictDocument } from './../../models/definitions/districts';

const District = {
  async city(
    district: IDistrictDocument,
    _params,
    { models: { Cities } }: IContext
  ) {
    return Cities.findOne({
      _id: district.cityId
    }).lean();
  },

  async center(
    district: IDistrictDocument,
    _params,
    { models: { Districts } }: IContext
  ) {
    const distDoc = await Districts.findOne({
      _id: district._id
    }).lean();

    if (!distDoc || !distDoc.center) {
      return null;
    }

    return {
      lat: distDoc.center.coordinates[1],
      lng: distDoc.center.coordinates[0]
    };
  }
};

export { District };
