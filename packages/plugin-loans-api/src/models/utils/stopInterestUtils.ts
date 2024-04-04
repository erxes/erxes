import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';

export async function stopInterestContract(
  contract: IContractDocument,
  currentDate: Date,
  models: IModels
) {
  await models.Contracts.updateOne(
    { _id: contract._id },
    { $set: { stoppedInterestDate: currentDate, isStoppedInterest: true } }
  );
}
