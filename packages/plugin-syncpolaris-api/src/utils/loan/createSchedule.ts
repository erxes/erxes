import { fetchPolaris } from '../utils';

export const createLoanSchedule = async (subdomain: string, contract: any) => {
  const sendData = [
    contract.number,
    contract.startDate,
    contract.leaseAmount,
    '1',
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
