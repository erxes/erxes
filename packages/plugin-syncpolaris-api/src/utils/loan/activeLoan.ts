import { generateModels } from '../../connectionResolver';
import { fetchPolaris, updateContract } from '../utils';

export const activeLoan = async (
  subdomain: string,
  polarisConfig,
  params: any
) => {
  const models = await generateModels(subdomain);

  const syncLogDoc = {
    type: '',
    contentType: 'savings:contract',
    contentId: params.contractNumber,
    createdAt: new Date(),
    createdBy: '',
    consumeData: params.contractNumber,
    consumeStr: JSON.stringify(params.contractNumber)
  };

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  const result = await fetchPolaris({
    op: '13610263',
    data: [params.contractNumber, 'данс нээв', null],
    subdomain,
    models,
    polarisConfig,
    syncLog
  });

  if (result) {
    await updateContract(
      subdomain,
      { number: params.contractNumber },
      {
        $set: {
          isActiveLoan: true
        }
      },
      'loans'
    );
  }

  return result;
};
