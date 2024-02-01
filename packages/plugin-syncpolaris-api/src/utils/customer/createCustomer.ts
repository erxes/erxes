import { customFieldToObject, setCustomerCode, fetchPolaris } from '../utils';
import { IPolarisCustomer } from './types';
import { validateObject } from './validator';

export const createCustomer = async (subdomain: string, params) => {
  const customer = params.updatedDocument || params.object;

  const data = await customFieldToObject(
    subdomain,
    'contacts:customer',
    customer,
  );

  let sendData: IPolarisCustomer = {
    lastName: data.lastName ?? 'Bold',
    firstName: data.firstName ?? 'Bold',
    familyName: data.familyName ?? 'Bold',
    email: data.email ?? 'br@gma.cm',
    mobile: data.mobile ?? '99119911',
    birthDate: data.birthDate ?? '1995-02-27 00:00:00',

    custSegCode: '81',
    isVatPayer: data.isVatPayer ?? 1,
    sexCode: data.sexCode ?? '1',
    taxExemption: data.taxExemption ?? '0',
    status: '1',
    noCompany: data.noCompany ?? 0,
    isCompanyCustomer: 1,
    industryId: data.industryId ?? '2',
    birthPlaceId: data.birthPlaceId ?? 161204,
    shortName: data.shortName ?? 'shortName',
    registerMaskCode: '3',
    registerCode: data.registerCode ?? '',
    countryCode: '496',
    industryName: data.industryName ?? 'ГАЗАР ТАРИАЛАН',
    catId: data.catId ?? '',
    ethnicGroupId: data.ethnicGroupId ?? '',
    langCode: data.langCode ?? '1',
    maritalStatus: data.maritalStatus ?? '1',
    birthPlaceName: data.birthPlaceName ?? 'МОНГОЛ',
    birthPlaceDetail: data.birthPlaceDetail ?? 'МОНГОЛ',
    phone: data.phone ?? '',
    fax: data.fax ?? 'fax',
    isBl: data.isBl ?? '',
    isPolitical: data.isPolitical ?? '',
  };

  await validateObject(sendData);

  const customerCode = await fetchPolaris({
    subdomain,
    op: '13610313',
    data: [sendData],
  });

  if (customerCode) {
    await setCustomerCode(subdomain, params.object._id, customerCode);
  }

  return customerCode;
};
