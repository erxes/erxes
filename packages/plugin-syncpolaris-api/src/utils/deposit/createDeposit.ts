import { generateModels } from '../../connectionResolver';
import {
  fetchPolaris,
  getBranch,
  sendMessageBrokerData,
  updateContract
} from '../utils';
import { IPolarisDeposit } from './types';
import { updateDeposit } from './updateDeposit';
import { validateDepositObject } from './validator';

export const createDeposit = async (
  subdomain: string,
  polarisConfig,
  deposit
) => {
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
    contentId: deposit._id,
    createdAt: new Date(),
    createdBy: '',
    consumeData: deposit,
    consumeStr: JSON.stringify(deposit)
  };

  const preSuccessValue = await models.SyncLogs.findOne({
    contentType: 'savings:contract',
    contentId: deposit._id,
    error: { $exists: false },
    responseData: { $exists: true, $ne: null }
  }).sort({ createdAt: -1 });

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  if (preSuccessValue) {
    return await updateDeposit(
      subdomain,
      models,
      polarisConfig,
      syncLog,
      deposit
    );
  }

  const savingProduct = await sendMessageBrokerData(
    subdomain,
    'savings',
    'contractType.findOne',
    { _id: deposit.contractTypeId }
  );

  const branch = await getBranch(subdomain, deposit.branchId);

  const customer = await sendMessageBrokerData(
    subdomain,
    'core',
    'customers.findOne',
    { _id: deposit.customerId }
  );

  let sendData: IPolarisDeposit = {
    acntType: 'CA',
    prodCode: savingProduct.code,
    brchCode: branch.code,
    curCode: deposit.currency,
    custCode: customer.code,
    name: `${customer.firstName} ${customer.lastName}`,
    name2: `${customer.firstName} ${customer.lastName}`,
    slevel: deposit.slevel || '1',
    jointOrSingle: 'S',
    dormancyDate: '',
    statusDate: '',
    flagNoCredit: '0',
    flagNoDebit: '0',
    salaryAcnt: 'N',
    corporateAcnt: 'N',
    capAcntCode: '',
    capMethod: '0',
    segCode: '81',
    paymtDefault: '',
    odType: 'NON'
  };

  await validateDepositObject(sendData);

  const depositCode = await fetchPolaris({
    subdomain,
    op: '13610020',
    data: [sendData],
    models,
    polarisConfig,
    syncLog
  });

  if (typeof depositCode === 'string') {
    await updateContract(
      subdomain,
      { _id: deposit._id },
      { $set: { number: JSON.parse(depositCode), isSyncedPolaris: true } },
      'savings'
    );
  }

  return depositCode;
};
