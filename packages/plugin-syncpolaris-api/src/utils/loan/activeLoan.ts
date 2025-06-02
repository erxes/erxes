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
    contentType: 'loans:contract',
    contentId: params,
    createdAt: new Date(),
    createdBy: '',
    consumeData: params,
    consumeStr: JSON.stringify(params)
  };

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  const result = await fetchPolaris({
    op: '13610263',
    data: [params, 'данс нээв', null],
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
          isActiveLoan: true
        }
      },
      'loans'
    );
  }

  return result;
};
