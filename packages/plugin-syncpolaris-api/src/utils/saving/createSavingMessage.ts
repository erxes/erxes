import { generateModels } from '../../connectionResolver';
import {
  fetchPolaris,
  getBranch,
  updateContract,
  sendMessageBrokerData,
} from '../utils';
import { activeSaving } from './activeSaving';
import { getDate } from './getDate';

export const createSavingMessage = async (
  subdomain: string,
  polarisConfig,
  params
) => {
  const savingContract = params.data;
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
    contentId: params.data._id,
    createdAt: new Date(),
    createdBy: '',
    consumeData: params.data,
    consumeStr: JSON.stringify(params.data),
  };

  const preSuccessValue = await models.SyncLogs.findOne({
    contentType: 'savings:contract',
    contentId: params.data._id,
    error: { $exists: false },
    responseData: { $exists: true, $ne: null },
  }).sort({ createdAt: -1 });

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  if (preSuccessValue) {
    throw new Error('already synced');
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
    polarisConfig,
  });

  const customerAccount = getAccounts.filter(
    (account) => account.acntType === 'CA'
  );

  const branch = await getBranch(subdomain, savingContract.branchId);

  const systemDate = await getDate(subdomain, polarisConfig);

  const endDate = new Date(systemDate).setMonth(
    new Date(systemDate).getMonth() + savingContract.duration
  );

  let sendData = {
    prodCode: contractType.code,
    slevel: 1,
    capMethod: '1',
    capAcntCode:
      customerAccount && customerAccount.length > 0
        ? customerAccount[0].acntCode
        : '',
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
    lastDtDate: '',
  };

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
      syncLog,
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
          endDate: new Date(endDate),
        },
      },
      'savings'
    );

    await activeSaving(subdomain, polarisConfig, [savingCode, 'данс нээв']);
  }

  return savingCode;
};
