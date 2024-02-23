import {
  customFieldToObject,
  fetchPolaris,
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

export const updateDeposit = async (subdomain: string, params) => {
  const deposit = params.updatedDocument || params.object;

  const objectCus = await customFieldToObject(
    subdomain,
    'savings:contract',
    deposit,
  );
  const savingProduct = await getSavingProduct(
    subdomain,
    deposit.contractTypeId,
  );

  let sendData: IPolarisDeposit = {
    acntType: objectCus.acntType,
    prodCode: savingProduct.code,
    brchCode: 'deposit.brchCode',
    curCode: savingProduct.currency,
    custCode: '',
    name: deposit.number,
    name2: deposit.number,
    slevel: objectCus.slevel,
    jointOrSingle: setValue(objectCus.jointOrSingle),
    dormancyDate: objectCus.dormancyDate,
    statusDate: objectCus.statusDate,
    flagNoCredit: setValue(objectCus.flagNoCredit),
    flagNoDebit: setValue(objectCus.flagNoCredit),
    salaryAcnt: setValue(objectCus.salaryAcnt),
    corporateAcnt: setValue(objectCus.corporateAcnt),
    capAcntCode: objectCus.capAcntCode,
    capMethod: setValue(objectCus.capMethod),
    segCode: objectCus.segCode,
    paymtDefault: setValue(objectCus.paymtDefault),
    odType: objectCus.odType,
  };

  await validateDepositObject(sendData);

  const depositCode = await fetchPolaris({
    subdomain,
    op: '13610021',
    data: [sendData],
  });

  if (typeof depositCode === 'string') {
    await updateSavingNumber(subdomain, deposit._id, depositCode);
  }
};
