import { IContext } from '../../connectionResolver';
import { IQuarterDocument } from './../../models/definitions/quarters';

const Quarter = {
  async district(
    quarter: IQuarterDocument,
    _params,
    { models: { Districts } }: IContext
  ) {
    return Districts.findOne({
      _id: quarter.districtId
    }).lean();
  }
};

export { Quarter };
