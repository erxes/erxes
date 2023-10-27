import { IModels, generateModels } from '../connectionResolver';
import {
  CONTRACT_STATUS,
  STORE_INTEREST_INTERVAL
} from '../models/definitions/constants';
import { IContractDocument } from '../models/definitions/contracts';
import storeInterest from '../models/utils/storeInterestUtils';
import { getDaysInMonth, getDiffDay, getFullDate } from '../models/utils/utils';

export async function storeInterestCron(subdomain: string) {
  const models: IModels = await generateModels(subdomain);
  const nowDate = getFullDate(new Date());
  const contracts = await models.Contracts.find({
    lastStoredDate: { $lt: nowDate },
    status: CONTRACT_STATUS.NORMAL,
    interestRate: { $gt: 0 }
  }).lean();

  contracts.forEach((contract: IContractDocument) => {
    const lastStoredDate = getFullDate(contract.lastStoredDate);
    const diffDay = getDiffDay(lastStoredDate, nowDate);

    switch (contract.storeInterestInterval) {
      case STORE_INTEREST_INTERVAL.DAILY:
        if (diffDay > 0) storeInterest(contract, models);
        break;
      case STORE_INTEREST_INTERVAL.MONTLY:
        let nextMonth = new Date(lastStoredDate);
        nextMonth.setMonth(lastStoredDate.getMonth() + 1);

        if (lastStoredDate === nextMonth) storeInterest(contract, models);
        break;
      case STORE_INTEREST_INTERVAL.END_OF_MONTH:
        if (getDaysInMonth(nowDate) === nowDate.getDate())
          storeInterest(contract, models);
        break;
      case STORE_INTEREST_INTERVAL.END_OF_CONTRACT:
        if (contract.endDate === nowDate) storeInterest(contract, models);
        break;

      default:
        break;
    }
  });
}
