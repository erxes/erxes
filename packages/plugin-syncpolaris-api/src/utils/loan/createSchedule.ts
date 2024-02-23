import { fetchPolaris } from '../utils';

const getMethod = (method) => {
  switch (method) {
    case 'equal':
      return '1';
    case 'fixed':
      return '3';
    case 'custom':
      return '4';

    default:
      break;
  }
};

export const createLoanSchedule = async (subdomain: string, contract: any) => {
  const sendData = [
    contract.number,
    contract.startDate,
    contract.leaseAmount,
    getMethod(contract.repayment),
    'M',
    null,
    contract.scheduleDays?.[0],
    contract.scheduleDays?.[1] ?? null,
    '1',
    0,
    0,
    0,
    'SIMPLE_INT',
    contract.endDate,
    null,
    contract.description,
    [],
    [],
  ];

  console.log('createLoanSchedule', sendData);

  const result = await fetchPolaris({
    op: '13610263',
    data: sendData,
    subdomain,
  });

  return result;
};
