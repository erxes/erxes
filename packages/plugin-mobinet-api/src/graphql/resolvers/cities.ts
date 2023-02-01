import { IContext } from '../../connectionResolver';
import { ICityDocument } from './../../models/definitions/cities';

const City = {
  async center(city: ICityDocument, _params, { models: { Cities } }: IContext) {
    const cityDoc = await Cities.findOne({
      _id: city._id
    }).lean();

    if (!cityDoc || !cityDoc.center) {
      return null;
    }

    return {
      lat: cityDoc.center.coordinates[1],
      lng: cityDoc.center.coordinates[0]
    };
  }
};

export { City };
