import { ISyncLogDocument } from "../../models/definitions/syncLog";
import { customFieldToObject, updateCustomer, fetchPolaris, genObjectOfRule } from "../utils";
import { getCustomerDetailByRegister } from "./getCustomerDetailByRegister";
import { IPolarisCustomer } from "./types";
import { validateObject } from "./validator";

export const createCustomer = async (subdomain: string, models, polarisConfig, syncLog: ISyncLogDocument, params) => {
  const customer = params.updatedDocument || params.object;

  const data = await customFieldToObject(
    subdomain,
    "contacts:customer",
    customer
  );

  const dataOfRules = await genObjectOfRule(
    subdomain,
    "contacts:customer",
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
    registerCode: data.registerCode,
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
    ...dataOfRules
  };

  await validateObject(sendData);

  const customerCode = await fetchPolaris({
    subdomain,
    op: "13610313",
    data: [sendData],
    models,
    polarisConfig,
    syncLog
  }).catch(async (e) => {
    //check register number duplicated
    if (e.message.includes("41020330")) {
      let customerData = await getCustomerDetailByRegister(subdomain, {
        register: sendData.registerCode,
      });

      if (customerData) {
        await updateCustomer(
          subdomain,
          { _id: customer._id },
          { code: customerData.custCode }
        );
      }
    } else {
      throw new Error(e.message);
    }
  });

  if (customerCode) {
    await updateCustomer(
      subdomain,
      { _id: customer._id },
      { code: customerCode }
    );
  }

  return customerCode;
};
