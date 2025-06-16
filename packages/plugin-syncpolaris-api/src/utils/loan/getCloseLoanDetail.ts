import { fetchPolaris, getContract } from '../utils';

export const getCloseLoanDetail = async (
  subdomain,
  polarisConfig,
  classification
) => {
  const loanContract = await getContract(
    subdomain,
    classification.contractId,
    'loans'
  );

  const loanCloseDetail = [loanContract.number, loanContract.endDate];

  const loanChangeClassificationReponse = await fetchPolaris({
    subdomain,
    op: '13610266',
    data: loanCloseDetail,
    polarisConfig
  });

  return loanChangeClassificationReponse;
};
