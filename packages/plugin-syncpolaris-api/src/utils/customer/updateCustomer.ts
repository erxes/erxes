import { IModels } from '../../connectionResolver';
import { customFieldToObject, setCustomerCode, fetchPolaris } from '../utils';

export const updateCustomer = async (subdomain, params, models: IModels) => {
  const customer = params.updatedDocument || params.object;

  const customerLog = await models.SyncLogs.findOne({
    contentId: customer._id,
    error: { $exists: false },
  });

  let sendData = {};

  const data = await customFieldToObject(
    subdomain,
    'contacts:customer',
    customer,
  );

  sendData = [
    {
      lastName: data.lastName ?? null,
      firstName: data.firstName ?? null,
      familyName: data.familyName ?? null,
      custSegCode: data.custSegCode ?? null,
      isVatPayer: data.isVatPayer ?? null,
      sexCode: data.sexCode ?? null,
      taxExemption: data.taxExemption ?? null,
      status: data.status ?? null,
      noCompany: data.noCompany ?? null,
      isCompanyCustomer: data.isCompanyCustomer ?? null,
      industryId: data.industryId ?? null,
      birthPlaceId: data.birthPlaceId ?? null,
      shortName: data.shortName ?? null,
      shortName2: data.shortName2 ?? null,
      registerMaskCode: '3' ?? null,
      registerCode: data.registerCode ?? null,
      birthDate: data.birthDate ?? null,
      mobile: data.mobile ?? null,
      countryCode: data.countryCode ?? null,
      email: data.email ?? null,
      industryName: data.industryName ?? null,
      catId: data.catId ?? null,
      ethnicGroupId: data.ethnicGroupId ?? null,
      langCode: data.langCode ?? null,
      maritalStatus: data.maritalStatus ?? null,
      birthPlaceName: data.birthPlaceName ?? null,
      birthPlaceDetail: data.birthPlaceDetail ?? null,
      phone: data.phone ?? null,
      fax: data.fax ?? null,
      isBl: data.isBl ?? null,
      isPolitical: data.isPolitical ?? null,
    },
  ];

  const customerCode = await fetchPolaris({
    subdomain,
    op: '13610315',
    data: sendData,
  });

  return customerCode;
};
