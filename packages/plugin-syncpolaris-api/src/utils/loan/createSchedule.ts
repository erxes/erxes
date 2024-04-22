import { fetchPolaris, getFullDate } from '../utils';

const getMethod = (method) => {
  switch (method) {
    case 'equal':
      return '3';
    case 'fixed':
      return '1';
    case 'custom':
      return '4';

    default:
      break;
  }
};

const getHolidayMethod = (method) => {
  switch (method) {
    case 'before':
      return '1';
    case 'after':
      return '2';

    default:
      return '2';
  }
};

export const createLoanSchedule = async (subdomain: string, contract: any) => {
  const sendData = [
    contract.number,
    getFullDate(contract.startDate),
    contract.leaseAmount,
    getMethod(contract.repayment),
    'M',
    null,
    contract.scheduleDays?.[0],
    contract.scheduleDays?.[1] ?? null,
    getHolidayMethod(contract.holidayType),
    0,
    0,
    0,
    'SIMPLE_INT',
    getFullDate(contract.endDate),
    null,
    contract.description,
    [],
    []
  ];

  const result = await fetchPolaris({
    op: '13610258',
    data: sendData,
    subdomain
  });

  return result;
};
