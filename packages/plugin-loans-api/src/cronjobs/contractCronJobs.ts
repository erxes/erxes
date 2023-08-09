import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { IModels, generateModels } from '../connectionResolver';
import { sendMessageBroker } from '../messageBroker';
import {
  CONTRACT_STATUS,
  SCHEDULE_STATUS
} from '../models/definitions/constants';
import { IContractDocument } from '../models/definitions/contracts';
import { IScheduleDocument } from '../models/definitions/schedules';
import {
  trAfterSchedule,
  transactionRule
} from '../models/utils/transactionUtils';
import { getFullDate } from '../models/utils/utils';

export async function checkContractScheduleAnd(subdomain: string) {
  const models: IModels = await generateModels(subdomain);
  const today = getFullDate(new Date());

  //find not changed schedules
  const contractIds = await models.Schedules.find({
    payDate: { $lte: new Date(today.getTime() + 1000 * 3600 * 24) },
    isDefault: true,
    status: SCHEDULE_STATUS.PENDING,
    balance: { $gt: 0 }
  })
    .select('contractId')
    .distinct('contractId');

  if (!contractIds.length) return;

  //if there is unchanged schedules then get contract infos
  const loanContracts: IContractDocument[] = await models.Contracts.find({
    status: [CONTRACT_STATUS.NORMAL, CONTRACT_STATUS.BAD],
    _id: contractIds
  })
    .select('_id customerId number')
    .lean();

  if (!loanContracts.length) return;
  const isEnabledClientportal = await isEnabled('clientportal');
  //then there's is contracts now resolve schedules
  for await (let contract of loanContracts) {
    isEnabledClientportal &&
      sendMessageBroker(
        {
          subdomain,
          data: {
            receivers: contract.customerId,
            title: `Мэдэгдэл`,
            content: `${contract.number} гэрээний эргэн төлөлт өнөөдөр тул та хугцаандаа эргэн төлөлт өө хийнэ үү`,
            notifType: 'system',
            link: ''
          },
          action: 'sendNotification'
        },
        'clientportal'
      );
    //get unresolved schedules
    const unresolvedSchedules = await models.Schedules.find({
      contractId: contract._id,
      payDate: {
        $lte: new Date(today.getTime() + 1000 * 3600 * 24)
      },
      status: SCHEDULE_STATUS.PENDING,
      balance: { $gt: 0 },
      isDefault: true
    }).sort({ payDate: 1 });

    if (!unresolvedSchedules.length) continue;

    for await (let scheduleRow of unresolvedSchedules) {
      //create empty row transaction to the schedule
      let doc = {
        contractId: contract._id,
        payDate: scheduleRow.payDate,
        description: `${contract.number} schedule correction`,
        total: 0,
        customerId: contract.customerId
      };

      //create tmp transaction
      const trInfo = await transactionRule(models, subdomain, doc);
      //now resolve schedules
      await trAfterSchedule(models, { ...doc, ...trInfo } as any);
    }

    let isExpired = false;

    const lastMainSchedule: IScheduleDocument &
      any = await models.Schedules.findOne({
      contractId: contract._id,
      isDefault: true,
      payDate: { $lte: today }
    })
      .select({
        payDate: 1,
        status: 1,
        payment: 1,
        interestEve: 1,
        interestNonce: 1
      })
      .sort({ payDate: -1 })
      .lean();

    const nextSchedule: IScheduleDocument &
      any = await models.Schedules.findOne({
      contractId: contract._id,
      isDefault: true,
      payDate: { $gte: today }
    })
      .select({ payDate: 1 })
      .sort({ payDate: 1 })
      .lean();

    if (
      !!lastMainSchedule &&
      lastMainSchedule.status === SCHEDULE_STATUS.LESS
    ) {
      let payment = lastMainSchedule.payment;
      let interestEve = lastMainSchedule.interestEve;
      let interestNonce = lastMainSchedule.interestNonce;
      const betweenSchedule = await models.Schedules.find({
        contractId: contract._id,
        payDate: {
          $gt: lastMainSchedule.payDate,
          $lte: today
        }
      }).select({ didPayment: 1, didInterestEve: 1, didInterestNonce: 1 });
      if (betweenSchedule.length > 0) {
        for (let schedule of betweenSchedule) {
          payment -= schedule.didPayment || 0;
          interestEve -= schedule.didInterestEve || 0;
          interestNonce -= schedule.didInterestNonce || 0;
        }
        if (payment > 0 || interestEve > 0 || interestNonce > 0)
          isExpired = true;
      } else isExpired = true;
    }

    if (
      !!isExpired !== !!contract.isExpired ||
      contract.repaymentDate !== nextSchedule.payDate
    ) {
      await models.Contracts.updateOne(
        { _id: contract._id },
        { $set: { isExpired, repaymentDate: nextSchedule.payDate } }
      );
    }
  }
}
