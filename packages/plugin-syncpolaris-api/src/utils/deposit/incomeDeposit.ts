import { generateModels } from '../../connectionResolver';
import {
  customFieldToObject,
  fetchPolaris,
  getCustomer,
  sendMessageBrokerData,
  updateTransaction
} from '../utils';

export const incomeDeposit = async (subdomain, polarisConfig, params) => {
  let deposits: any[] = [];
  const filtered = params.filter((tx) => tx.isSyncedTransaction !== true);
  const models = await generateModels(subdomain);

  for (const param of filtered) {
    const savingContract = await sendMessageBrokerData(
      subdomain,
      'savings',
      'contracts.findOne',
      { _id: param.contractId }
    );

    const customer = await getCustomer(subdomain, savingContract.customerId);

    const customerData = await customFieldToObject(
      subdomain,
      'core:customer',
      customer
    );

    const loanGiveReponse = await fetchPolaris({
      op: '13611307',
      data: [
        [
          {
            _iField: 'STATUS',
            _iOperation: 'IN',
            _inValues: ['O', 'N']
          }
        ],
        0,
        25
      ],
      subdomain,
      polarisConfig
    });

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

    let sendData = {
      txnAcntCode: loanGiveReponse[0].acntCode,
      txnAmount: param.total,
      rate: 1,
      contAcntCode: savingContract.number,
      contAmount: param.total,
      contRate: 1,
      rateTypeId: '16',
      txnDesc: param.description ?? '',
      tcustName: customerData?.firstName ?? '',
      tcustAddr: customerData?.address ?? '',
      tcustRegister: customerData?.registerCode ?? '',
      tcustRegisterMask: '3',
      tcustContact: customerData?.mobile ?? '',
      sourceType: 'TLLR',
      isPreview: 0,
      isPreviewFee: null,
      isTmw: 1
    };

    if (savingContract?.number && param?.total != null) {
      const deposit = await fetchPolaris({
        op: '13610651',
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

      deposits.push(deposit);
    }
  }

  return deposits;
};
