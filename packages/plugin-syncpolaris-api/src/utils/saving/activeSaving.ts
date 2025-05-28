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
    contentId: params,
    createdAt: new Date(),
    createdBy: '',
    consumeData: params,
    consumeStr: JSON.stringify(params)
  };

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  const result = await fetchPolaris({
    op: '13610122',
    data: [params, 'данс нээв'],
    subdomain,
    models,
    polarisConfig,
    syncLog
  });

  if (result) {
    await updateContract(
      subdomain,
      { number: params },
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
