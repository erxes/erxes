import {
  fetchPolaris,
  getBranch,
  updateContract,
  sendMessageBrokerData,
} from '../utils';
import { activeSaving } from './activeSaving';
import { getDate } from './getDate';

export const createSaving = async (
  subdomain: string,
  models,
  polarisConfig,
  syncLog,
  params
) => {
  const savingContract = params.object;
  let savingCode;

  const savingProduct = await sendMessageBrokerData(
    subdomain,
    'savings',
    'contractType.findOne',
    { _id: savingContract.contractTypeId }
  );

  const customer = await sendMessageBrokerData(
    subdomain,
    'core',
    'customers.findOne',
    { _id: savingContract.customerId }
  );

  const getAccounts = await await fetchPolaris({
    op: '13610120',
    data: [customer?.code, 0, 20],
    subdomain,
    models,
    polarisConfig,
    syncLog,
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
    prodCode: savingProduct.code,
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
    savingProduct?.code &&
    savingProduct.name != null &&
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
          endDate: new Date(endDate),
        },
      },
      'savings'
    );

    await activeSaving(subdomain, polarisConfig, [savingCode, 'данс нээв']);
  }

  return savingCode;
};
