import { generateModels } from '../../connectionResolver';
import { incomeDeposit } from '../deposit/incomeDeposit';
import {
  customFieldToObject,
  fetchPolaris,
  getContract,
  getCustomer,
  getDepositAccount
} from '../utils';

export const incomeSaving = async (subdomain, polarisConfig, params) => {
  let transaction;

  console.log(params, 'params');

  const models = await generateModels(subdomain);

  const syncLogDoc = {
    type: '',
    contentType: 'savings:transaction',
    contentId: params._id,
    createdAt: new Date(),
    createdBy: '',
    consumeData: params,
    consumeStr: JSON.stringify(params)
  };

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  const savingContract = await getContract(
    subdomain,
    { _id: params.contractId },
    'savings'
  );

  if (!savingContract) {
    throw new Error('Contract not found');
  }

  if (savingContract.isDeposit) {
    return await incomeDeposit(subdomain, polarisConfig, params);
  }

  const customer = await getCustomer(subdomain, params.customerId);

  const customerData = await customFieldToObject(
    subdomain,
    'core:customer',
    customer
  );

  const depositAccount = await getDepositAccount(subdomain, params.customerId);

  console.log(depositAccount, 'depositAccount');

  let sendData = {
    txnAcntCode: '300021000045',
    txnAmount: 6500,
    rate: 1,
    contAcntCode: savingContract.number,
    contAmount: 6500,
    contRate: 1,
    rateTypeId: '16',
    txnDesc: params?.description || 'shiljuuleg',
    tcustRegister: customerData?.registerCode || '',
    tcustRegisterMask: '3',
    sourceType: 'TLLR',
    refNo: '662',
    isPreview: 0,
    isPreviewFee: null,
    isTmw: 1
  };

  console.log(sendData, 'sendData');

  // if (savingContract?.number && params?.total != null) {
  //   transaction = await fetchPolaris({
  //     op: '13610055',
  //     data: [sendData],
  //     subdomain,
  //     models,
  //     polarisConfig,
  //     syncLog
  //   });
  // }

  // console.log(transaction, 'transaction');

  // return transaction;
};
