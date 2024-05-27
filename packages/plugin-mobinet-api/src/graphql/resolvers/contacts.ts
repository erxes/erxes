import { IContext } from '../../connectionResolver';
import { IContractDocument } from '../../models/definitions/contracts';

const Contract = {
  async building(
    contact: IContractDocument,
    _params,
    { models: { Buildings } }: IContext
  ) {
    return Buildings.findOne({
      _id: contact.buildingId
    }).lean();
  }
};

export { Contract };
