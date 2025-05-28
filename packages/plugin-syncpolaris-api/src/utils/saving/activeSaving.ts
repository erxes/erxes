import { generateModels } from '../../connectionResolver';
import { fetchPolaris, updateContract } from '../utils';

export const activeSaving = async (
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
    op: '13610122',
    data: [params.contractNumber, 'данс нээв'],
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
          isActiveSaving: true
        }
      },
      'savings'
    );
  }

  return result;
};
