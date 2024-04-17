import { IModels, generateModels } from '../connectionResolver';
import {
  CONTRACT_STATUS,
  SCHEDULE_STATUS
} from '../models/definitions/constants';
import { IContractDocument } from '../models/definitions/contracts';
import { getFullDate } from '../models/utils/utils';
import { storeInterestContract } from '../models/utils/storeInterestUtils';
import { createPeriodLock } from '../models/utils/periodLockUtils';
import { sendNotification } from '../models/utils/notificationUtils';
import { checkCurrentDateSchedule } from '../models/utils/scheduleCheckUtils';
import { createInvoice } from '../models/utils/invoiceUtils';
import { changeClassificationOneContract } from '../models/utils/changeClassificationUtils';
import { getConfig } from '../messageBroker';
import { IConfig } from '../interfaces/config';
import { scheduleFixCurrent } from '../models/utils/scheduleFixUtils';

function isDoPeriod(date: Date, config: IConfig, exactTime: string) {
  if (
    config.periodLockType === 'endOfMonth' &&
    date.getDate() === 1 &&
    exactTime === '0:0'
  )
    return true;
  if (config.periodLockType === 'daily' && exactTime === '0:0') return true;
  return false;
}

async function checkContractAction(
  subdomain,
  contract,
  today,
  models,
  periodLock,
  config
) {
  if (config.isStoreInterest)
    await storeInterestContract(
      contract,
      today,
      models,
      periodLock._id,
      config
    );

  if (config.isChangeClassification)
    await changeClassificationOneContract(contract, today, models, config);

  await scheduleFixCurrent(contract, today, models, config);

  const schedule = await checkCurrentDateSchedule(
    contract,
    today,
    models,
    config
  );

  if (!schedule) return;
  if (config.isCreateInvoice && schedule.status === SCHEDULE_STATUS.PENDING) {
    const invoice = await createInvoice(contract, today, models);

    if (invoice.total > 0) await sendNotification(subdomain, contract, invoice);
  }
}

export async function checkContractPeriod(subdomain: string) {
  const models: IModels = await generateModels(subdomain);
  const now = new Date();
  const today = getFullDate(now);
  const exactTime = `${now.getHours()}:${now.getMinutes()}`;
  const config: IConfig = await getConfig('loansConfig', subdomain);

  if (isDoPeriod(now, config, exactTime)) {
    const loanContracts: IContractDocument[] = await models.Contracts.find({
      status: CONTRACT_STATUS.NORMAL,
      lastStoredDate: { $ne: today }
    }).lean();

    if (!loanContracts.length) return;

    now.setDate(now.getDate() - 1);
    const periodDate = getFullDate(now);

    const periodLock = await createPeriodLock(periodDate, [], models);

    for await (let contract of loanContracts) {
      await checkContractAction(
        subdomain,
        contract,
        today,
        models,
        periodLock,
        config
      );
    }
  }
}
