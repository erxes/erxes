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
  }
};

export { Building };
