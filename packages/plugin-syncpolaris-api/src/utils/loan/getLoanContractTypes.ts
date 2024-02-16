import { fetchPolaris } from '../utils';

export const getLoanContractTypes = async (subdomain, params) => {
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
  }).then((response) => JSON.parse(response));

  return loanContractTypes;
};
