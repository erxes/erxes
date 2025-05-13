import { fetchPolaris, updateContract } from '../utils';

export const activeSaving = async (
  subdomain: string,
  polarisConfig,
  params: any
) => {
  const result = await fetchPolaris({
    op: '13610122',
    data: [params.contractNumber, 'данс нээв'],
    subdomain,
    polarisConfig,
  });

  if (result) {
    await updateContract(
      subdomain,
      { number: params.contractNumber },
      {
        $set: {
          isActiveSaving: true,
        },
      },
      'savings'
    );
  }

  return result;
};
