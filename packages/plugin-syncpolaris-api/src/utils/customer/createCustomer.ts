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
    lastName: data.lastName,
    firstName: data.firstName,
    familyName: data.familyName,
    email: data.emails.join(','),
    mobile: data.phones.join(','),
    birthDate: data.birthDate,

    custSegCode: '81',
    isVatPayer: data.isVatPayer,
    sexCode: data.sexCode,
    taxExemption: data.taxExemption ?? '0',
    status: '1',
    noCompany: data.noCompany ?? 0,
    isCompanyCustomer: 1,
    industryId: data.industryId,
    birthPlaceId: data.birthPlaceId,
    shortName: data.middleName,
    registerMaskCode: '3',
    registerCode: data.registerCode,
    countryCode: '496',
    industryName: data.industryName ?? '',
    catId: data.catId ?? '',
    ethnicGroupId: data.ethnicGroupId ?? '',
    langCode: data.langCode ?? '1',
    maritalStatus: data.maritalStatus ?? '1',
    birthPlaceName: data.birthPlaceName ?? '',
    birthPlaceDetail: data.birthPlaceDetail ?? '',
    phone: data.phones.join(','),
    fax: data.fax ?? '',
    isBl: data.isBl ?? '0',
    isPolitical: data.isPolitical ?? '0',
  };

  await validateObject(sendData);

  const customerCode = await fetchPolaris({
    subdomain,
    op: '13610313',
    data: [sendData],
  }).then((res) => JSON.parse(res));

  if (customerCode) {
    await setCustomerCode(subdomain, customer._id, customerCode);
  }

  return customerCode;
};
