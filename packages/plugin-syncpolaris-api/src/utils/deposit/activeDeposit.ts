import { fetchPolaris, updateContract } from '../utils';

export const activeDeposit = async (
  subdomain: string,
  polarisConfig,
  params: any
) => {
  const result = await fetchPolaris({
    op: '13610063',
    data: [params.contractNumber],
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
