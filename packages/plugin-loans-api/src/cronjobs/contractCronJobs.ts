import { IModels, generateModels } from '../connectionResolver';
import {
  CONTRACT_STATUS,
  SCHEDULE_STATUS,
} from '../models/definitions/constants';
import { IContractDocument } from '../models/definitions/contracts';
import { getFullDate } from '../models/utils/utils';
import { storeInterestContract } from '../models/utils/storeInterestUtils';
import { createPeriodLock } from '../models/utils/periodLockUtils';
import { sendNotification } from '../models/utils/notificationUtils';
import { checkCurrentDateSchedule } from '../models/utils/scheduleCheckUtils';
import { createInvoice } from '../models/utils/invoiceUtils';
import { massChangeClassification } from '../models/utils/changeClassificationUtils';

export async function checkContractScheduleAnd(subdomain: string) {
  const models: IModels = await generateModels(subdomain);
  const now = new Date();
  const today = getFullDate(now);
  const exactTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

  if (exactTime === '00:00:00') {
    const loanContracts: IContractDocument[] = await models.Contracts.find({
      status: CONTRACT_STATUS.NORMAL,
    }).lean();

    if (!loanContracts.length) return;
    now.setDate(now.getDate() - 1);
    const periodDate = getFullDate(now);

    const periodLock = await createPeriodLock(periodDate, [], models);

    for await (let contract of loanContracts) {
      await storeInterestContract(contract, today, models, periodLock._id);

      const schedule = await checkCurrentDateSchedule(contract, today, models);
      if (!schedule) return;
      if (
        schedule.status === SCHEDULE_STATUS.PENDING ||
        schedule.status === SCHEDULE_STATUS.EXPIRED ||
        schedule.status === SCHEDULE_STATUS.LESS
      ) {
        const invoice = await createInvoice(contract, today, models);

        if (invoice.total > 0)
          await sendNotification(subdomain, contract, invoice);
      }
    }

    await massChangeClassification(loanContracts, today, models);
  }
}
