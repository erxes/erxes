import { generateModels } from '../../connectionResolver';
import { fetchPolaris, updateContract } from '../utils';

export const activeDeposit = async (
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
    op: '13610063',
    data: [params],
    subdomain,
    models,
    polarisConfig,
    syncLog
  });

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

  return result;
};
