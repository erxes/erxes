import { fetchPolaris, updateContract } from '../utils';

export const activeLoan = async (
  subdomain: string,
  polarisConfig,
  params: any
) => {
  const result = await fetchPolaris({
    op: '13610263',
    data: [params.contractNumber, 'данс нээв', null],
    subdomain,
    polarisConfig,
  });

  if (result) {
    await updateContract(
      subdomain,
      { number: params.contractNumber },
      {
        $set: {
          isActiveLoan: true,
        },
      },
      'loans'
    );
  }

  return result;
};
