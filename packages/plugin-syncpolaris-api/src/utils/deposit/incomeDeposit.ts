import { generateModels } from '../../connectionResolver';
import {
  fetchPolaris,
  sendMessageBrokerData,
  updateTransaction
} from '../utils';

export const incomeDeposit = async (subdomain, polarisConfig, params) => {
  let deposit;
  const filtered = params.filter((tx) => tx.isSyncedTransaction !== true);
  const models = await generateModels(subdomain);

  for (const param of filtered) {
    const savingContract = await sendMessageBrokerData(
      subdomain,
      'savings',
      'contracts.findOne',
      { _id: param.contractId }
    );

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
      operCode: '13610009',
      txnAcntCode: savingContract.number,
      txnAmount: param.total,
      rate: '1',
      contAmount: param.total,
      contCurCode: param.currency,
      contRate: '1',
      txnDesc: param.description,
      tcustRegisterMask: '',
      sourceType: 'OI',
      isPreview: 0,
      isPreviewFee: null,
      isTmw: 1,
      isAdvice: 1,
      txnClearAmount: param.total,
      aspParam: [
        [
          {
            acntCode: savingContract.number,
            acntType: 'INCOME'
          }
        ]
      ]
    };

    deposit = await fetchPolaris({
      op: '13610009',
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

    return deposit;
  }
};
