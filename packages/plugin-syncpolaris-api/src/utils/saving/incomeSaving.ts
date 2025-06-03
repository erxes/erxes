import { generateModels } from '../../connectionResolver';
import {
  customFieldToObject,
  fetchPolaris,
  getContract,
  getCustomer,
  getDepositAccount,
  updateTransaction
} from '../utils';

export const incomeSaving = async (subdomain, polarisConfig, params) => {
  let transaction;
  const filtered = params.filter((tx) => tx.isSyncedTransaction !== true);

  const models = await generateModels(subdomain);

  for (const param of filtered) {
    const savingContract = await getContract(
      subdomain,
      { _id: param.contractId },
      'savings'
    );

    if (!savingContract) {
      throw new Error('Contract not found');
    }

    const syncLogDoc = {
      type: '',
      contentType: 'savings:transaction',
      contentId: savingContract.number,
      createdAt: new Date(),
      createdBy: '',
      consumeData: param,
      consumeStr: JSON.stringify(param)
    };

    let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

    const customer = await getCustomer(subdomain, param.customerId);

    const customerData = await customFieldToObject(
      subdomain,
      'core:customer',
      customer
    );

    const getAccounts = await fetchPolaris({
      op: '13610312',
      data: [customer?.code, 0, 20],
      subdomain,
      polarisConfig
    });

    const customerAccount = getAccounts.filter(
      (account) => account.acntType === 'CA'
    );

    const depositAccount = await getDepositAccount(subdomain, param.customerId);
    const polarisNumber =
      customerAccount && customerAccount.length > 0
        ? customerAccount[0].acntCode
        : '';

    let sendData = {
      txnAcntCode: depositAccount?.number || polarisNumber || '',
      txnAmount: param.total,
      rate: 1,
      contAcntCode: savingContract.number,
      contAmount: param.total,
      contRate: 1,
      rateTypeId: '16',
      txnDesc: param?.description || 'shiljuuleg',
      tcustRegister: customerData?.registerCode || '',
      tcustRegisterMask: '3',
      sourceType: 'TLLR',
      refNo: '662',
      isPreview: 0,
      isPreviewFee: 0,
      isTmw: 1
    };

    if (savingContract?.number && param?.total != null) {
      transaction = await fetchPolaris({
        op: '13610055',
        data: [sendData],
        subdomain,
        models,
        polarisConfig,
        syncLog
      });

      await updateTransaction(
        subdomain,
        { _id: param._id },
        {
          $set: {
            isSyncedTransaction: true
          }
        },
        'savings'
      );
    }

    return transaction;
  }
};
