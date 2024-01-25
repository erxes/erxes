import { IModels } from '../../connectionResolver';
import { customFieldToObject, setCustomerCode, fetchPolaris } from '../utils';

export const createCustomer = async (subdomain, params, models: IModels) => {
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
      lastName: data.lastName ?? '',
      firstName: data.firstName ?? '',
      familyName: data.familyName ?? '',
      custSegCode: data.custSegCode ?? '',
      isVatPayer: data.isVatPayer ?? 1,
      sexCode: data.sexCode ?? '',
      taxExemption: data.taxExemption ?? '',
      status: data.status ?? '',
      noCompany: data.noCompany ?? '',
      isCompanyCustomer: data.isCompanyCustomer ?? '',
      industryId: data.industryId ?? '',
      birthPlaceId: data.birthPlaceId ?? '',
      shortName: data.shortName ?? '',
      shortName2: data.shortName2 ?? '',
      registerMaskCode: '3' ?? '',
      registerCode: data.registerCode ?? '',
      birthDate: data.birthDate ?? '',
      mobile: data.mobile ?? '',
      countryCode: data.countryCode ?? '',
      email: data.email ?? '',
      industryName: data.industryName ?? '',
      catId: data.catId ?? '',
      ethnicGroupId: data.ethnicGroupId ?? '',
      langCode: data.langCode ?? '',
      maritalStatus: data.maritalStatus ?? '',
      birthPlaceName: data.birthPlaceName ?? '',
      birthPlaceDetail: data.birthPlaceDetail ?? '',
      phone: data.phone ?? '',
      fax: data.fax ?? '',
      isBl: data.isBl ?? '',
      isPolitical: data.isPolitical ?? '',
    },
  ];

  const customerCode = await fetchPolaris({
    subdomain,
    op: '13610313',
    data: sendData,
  });

  if (typeof customerCode === 'string') {
    await setCustomerCode(subdomain, customer._id, customerCode);
  }
};
