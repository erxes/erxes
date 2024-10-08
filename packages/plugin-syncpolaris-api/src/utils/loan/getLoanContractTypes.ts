import { fetchPolaris } from '../utils';

export const getLoanContractTypes = async (subdomain, polarisConfig, params) => {
  const loanContractTypes = await fetchPolaris({
    subdomain,
    op: '13611304',
    data: [
      [
        {
          _iField: 'STATUS',
          _iOperation: 'IN',
          _iType: 3,
          _inValues: ['O'],
        },
      ],
      0,
      25,
    ],
    polarisConfig
  });

  return loanContractTypes;
};
