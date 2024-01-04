import { IModels, generateModels } from '../connectionResolver';
import {
  CONTRACT_STATUS,
  STORE_INTEREST_INTERVAL
} from '../models/definitions/constants';
import { IContractDocument } from '../models/definitions/contracts';
import { closeOrExtend } from '../models/utils/closeOrExtendUtils';
import { checkContractInterestGive } from '../models/utils/giveInterestResult';
import storeInterest from '../models/utils/storeInterestUtils';
import { getDaysInMonth, getDiffDay, getFullDate } from '../models/utils/utils';

export async function storeInterestCron(subdomain: string) {
  const models: IModels = await generateModels(subdomain);
  const now = new Date();
  const nowDate = getFullDate(now);
  const exactTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

  if (exactTime === '00:00:00') {
    now.setTime(now.getTime() + 2 * 60 * 1000);
    const nextDate = getFullDate(now);

    const contracts = await models.Contracts.find({
      lastStoredDate: { $lt: nextDate },
      status: CONTRACT_STATUS.NORMAL,
      interestRate: { $gt: 0 }
    }).lean<IContractDocument>();

    for await (const contract of contracts) {
      await storeInterestMethod(contract, models, nowDate, nextDate);

      await checkContractInterestGive(contract, nextDate, models);

      await closeOrExtend(contract, models, nextDate);
    }
  }
}

async function storeInterestMethod(
  contract: IContractDocument,
  models: IModels,
  nowDate: Date,
  nextDate: Date
) {
  const lastStoredDate = getFullDate(contract.lastStoredDate);
  const diffDay = getDiffDay(lastStoredDate, nextDate);
  switch (contract.storeInterestInterval) {
    case STORE_INTEREST_INTERVAL.DAILY:
      if (diffDay > 0) await storeInterest(contract, models, nextDate);

      break;
    case STORE_INTEREST_INTERVAL.MONTLY:
      let nextMonth = new Date(lastStoredDate);
      nextMonth.setMonth(lastStoredDate.getMonth() + 1);

      if (lastStoredDate === nextMonth)
        await storeInterest(contract, models, nextDate);

      break;
    case STORE_INTEREST_INTERVAL.END_OF_MONTH:
      if (getDaysInMonth(nowDate) === nowDate.getDate())
        await storeInterest(contract, models, nextDate);

      break;
    case STORE_INTEREST_INTERVAL.END_OF_CONTRACT:
      if (contract.endDate === nowDate)
        await storeInterest(contract, models, nextDate);

      break;

    default:
      break;
  }
}
