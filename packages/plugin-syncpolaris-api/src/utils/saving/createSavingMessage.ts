import { generateModels } from '../../connectionResolver';
import {
  fetchPolaris,
  getBranch,
  updateContract,
  sendMessageBrokerData
} from '../utils';
import { getDate } from './getDate';
import { IPolarisSaving } from './types';
import { updateSaving } from './updateSaving';
import { validateSavingObject } from './validator';

export const createSavingMessage = async (
  subdomain: string,
  polarisConfig,
  savingContract,
  user?
) => {
  const { contractType } = savingContract;

  let savingCode;

  if (
    !polarisConfig ||
    !polarisConfig.apiUrl ||
    !polarisConfig.token ||
    !polarisConfig.companyCode ||
    !polarisConfig.role
  ) {
    return;
  }

  const models = await generateModels(subdomain);

  const syncLogDoc = {
    type: '',
    contentType: 'savings:contract',
    contentId: savingContract._id,
    createdAt: new Date(),
    createdBy: '',
    consumeData: savingContract,
    consumeStr: JSON.stringify(savingContract)
  };

  const preSuccessValue = await models.SyncLogs.findOne({
    contentType: 'savings:contract',
    contentId: savingContract._id,
    error: { $exists: false },
    responseData: { $exists: true, $ne: null }
  }).sort({ createdAt: -1 });

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  if (preSuccessValue) {
    return await updateSaving(
      subdomain,
      models,
      polarisConfig,
      syncLog,
      savingContract,
      user
    );
  }

  const customer = await sendMessageBrokerData(
    subdomain,
    'core',
    'customers.findOne',
    { _id: savingContract.customerId }
  );

  if (!customer?.code) {
    throw new Error('Customer code is required before calling fetchPolaris.');
  }

  const getAccounts = await fetchPolaris({
    op: '13610312',
    data: [customer?.code, 0, 20],
    subdomain,
    polarisConfig
  });

  const customerAccount = getAccounts.filter(
    (account) => account.acntType === 'CA'
  );

  const deposit = await sendMessageBrokerData(
    subdomain,
    'savings',
    'contracts.findOne',
    { _id: savingContract.depositAccount }
  );

  const branch = await getBranch(subdomain, savingContract.branchId);

  const systemDate = await getDate(subdomain, polarisConfig);

  const endDate = new Date(systemDate).setMonth(
    new Date(systemDate).getMonth() + savingContract.duration
  );

  const depositNumber = deposit?.number || '';
  const polarisNumber =
    customerAccount && customerAccount.length > 0
      ? customerAccount[0].acntCode
      : '';

  let sendData: IPolarisSaving = {
    prodCode: contractType.code,
    slevel: 1,
    capMethod: '1',
    capAcntCode: depositNumber || polarisNumber || '',
    capAcntSysNo: '1306',
    startDate: systemDate,
    maturityOption: 'C',
    rcvAcntCode: '',
    brchCode: branch?.code,
    curCode: savingContract.currency,
    name: `${customer.firstName} ${customer.lastName}`,
    name2: `${customer.firstName} ${customer.lastName}`,
    termLen: savingContract.duration,
    maturityDate: new Date(endDate),
    custCode: customer?.code,
    segCode: '81',
    jointOrSingle: 'S',
    statusCustom: 'N',
    statusDate: '',
    casaAcntCode: '',
    closedBy: '',
    closedDate: '',
    lastCtDate: '',
    lastDtDate: ''
  };

  await validateSavingObject(sendData);

  if (
    contractType?.code &&
    savingContract.duration != null &&
    customer?.code != null &&
    branch?.code != null
  ) {
    savingCode = await fetchPolaris({
      op: '13610120',
      data: [sendData],
      subdomain,
      models,
      polarisConfig,
      syncLog
    });
  }

  if (savingCode) {
    await updateContract(
      subdomain,
      { _id: savingContract._id },
      {
        $set: {
          number: JSON.parse(savingCode),
          startDate: new Date(systemDate),
          isSyncedPolaris: true,
          endDate: new Date(endDate)
        }
      },
      'savings'
    );
  }

  return savingCode;
};
