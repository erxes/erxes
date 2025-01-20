import { customFieldToObject, fetchPolaris, genObjectOfRule } from '../utils';
import { IPolarisCustomer } from './types';
import { validateObject } from './validator';

export const updateCustomer = async (subdomain, models, polarisConfig, syncLog, customer) => {
  const data = await customFieldToObject(subdomain, "core:customer", customer);

  const dataOfRules = await genObjectOfRule(
    subdomain,
    "core:customer",
    data,
    polarisConfig.customer
  );

  let sendData: IPolarisCustomer = {
    lastName: data.lastName,
    firstName: data.firstName,
    familyName: data.familyName,
    email: data.primaryEmail,
    mobile: data.phones.join(","),
    birthDate: data.birthDate,
    custSegCode: data.custSegCode,
    isVatPayer: data.isVatPayer,
    sexCode: data.sexCode,
    taxExemption: data.taxExemption ?? "0",
    status: "1",
    noCompany: data.noCompany ?? 0,
    isCompanyCustomer: 1,
    industryId: data.industryId,
    birthPlaceId: data.birthPlaceId,
    shortName: data.shortName,
    registerMaskCode: data.registerMaskCode || "3",
    countryCode: data.countryCode || "496",
    industryName: data.industryName ?? "",
    catId: data.catId ?? "",
    ethnicGroupId: data.ethnicGroupId ?? "",
    langCode: data.langCode ?? "1",
    maritalStatus: data.maritalStatus || "1",
    birthPlaceName: data.birthPlaceName ?? "",
    birthPlaceDetail: data.birthPlaceDetail ?? "",
    phone: data.primaryEmail,
    fax: data.fax ?? "",
    isBl: data.isBl ?? "0",
    isPolitical: data.isPolitical ?? "0",
    ...dataOfRules,
    custCode: customer.custCode,
    registerCode: data.registerCode,
  };

  await validateObject(sendData);

  return await fetchPolaris({
    subdomain,
    op: "13610315",
    data: [sendData],
    models,
    polarisConfig,
    syncLog
  });
};
