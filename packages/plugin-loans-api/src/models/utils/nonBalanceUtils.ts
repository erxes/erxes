import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';
import { getFullDate } from './utils';

export async function storeInterestNonBalance(
  contract: IContractDocument,
  amount: number,
  models: IModels
) {
  const storeDate = getFullDate(new Date());

  await models.StoredInterest.create({
    description: 'nonBalance store interest',
    invDate: storeDate,
    prevStoredDate: contract.lastStoredDate,
    amount: amount,
    contractId: contract._id,
    type: 'nonBalance'
  });

  await models.Contracts.updateOne(
    { _id: contract._id },
    { $set: { lastStoredDate: storeDate } }
  );
}
