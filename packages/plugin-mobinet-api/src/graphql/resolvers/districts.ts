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
  }
};

export { District };
