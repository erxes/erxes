import { IContext } from '../../connectionResolver';
import { IBuildingDocument } from './../../models/definitions/buildings';

const Building = {
  async quarter(
    building: IBuildingDocument,
    _params,
    { models: { Quarters } }: IContext
  ) {
    return Quarters.findOne({
      _id: building.quarterId
    }).lean();
  },

  async location(building, _params, _context) {
    return {
      lat: building.location.coordinates[1],
      lng: building.location.coordinates[0]
    };
  }
};

export { Building };
