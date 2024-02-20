import {
  customFieldToObject,
  fetchPolaris,
  getBranch,
  getCustomer,
  getSavingProduct,
  updateSavingNumber,
} from '../utils';
import { IPolarisDeposit } from './types';
import { validateDepositObject } from './validator';

function setValue(value) {
  switch (value) {
    case 'No':
      return 'N';
    case 'Yes':
      return 'Y';
    case 'Тийм':
      return '1';
    case 'Үгүй':
      return '0';
    case 'JOINT':
      return 'J';
    case 'SINGLE':
      return 'S';
    case 'өөр лүүгээ олгоно':
      return '0';
    case 'өөр CASA данс руу олгоно':
      return '1';
    case 'хугацаат хадгаламж руу олгоно':
      return '2';
    default:
      return '';
  }
}

export const createDeposit = async (subdomain: string, params) => {
  const deposit = params.updatedDocument || params.object;

  const objectDeposit = await customFieldToObject(
    subdomain,
    'savings:contract',
    deposit,
  );
  const savingProduct = await getSavingProduct(
    subdomain,
    deposit.contractTypeId,
  );

  const branch = await getBranch(subdomain, deposit.branchId);

  const customer = await getCustomer(subdomain, deposit.customerId);

  let sendData: IPolarisDeposit = {
    acntType: 'CA',
    prodCode: savingProduct.code,
    brchCode: branch.code,
    curCode: objectDeposit.currency,
    custCode: customer.code,
    name: deposit.number,
    name2: deposit.number,
    slevel: objectDeposit.slevel || '1',
    jointOrSingle: 'S',
    dormancyDate: '',
    statusDate: '',
    flagNoCredit: '0',
    flagNoDebit: '0',
    salaryAcnt: 'N',
    corporateAcnt: 'N',
    capAcntCode: '',
    capMethod: '0',
    segCode: '81',
    paymtDefault: '',
    odType: 'NON',
  };

  await validateDepositObject(sendData);

  const depositCode = await fetchPolaris({
    subdomain,
    op: '13610020',
    data: [sendData],
  });

  if (typeof depositCode === 'string') {
    await updateSavingNumber(subdomain, deposit._id, JSON.parse(depositCode));
  }

  return depositCode;
};
