import { IModels } from '../../connectionResolver';
import { CLOSE_OR_EXTEND, CONTRACT_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { addMonths } from './utils';

export async function closeOrExtend(
  contract: IContractDocument,
  models: IModels,
  currentDate: Date
) {
  if (contract.closeDate === currentDate) {
    switch (contract.closeOrExtendConfig) {
      case CLOSE_OR_EXTEND.AUTO_EXTEND:
        const newCloseDate = addMonths(contract.closeDate, contract.duration);
        await models.Contracts.updateOne(
          { _id: contract._id },
          { $set: { closeDate: newCloseDate } }
        );
        break;
      case CLOSE_OR_EXTEND.CLOSE_END_OF_CONTRACT:
        await models.Contracts.updateOne(
          { _id: contract._id },
          { $set: { status: CONTRACT_STATUS.CLOSED } }
        );
        break;
      default:
        break;
    }
  }
}
