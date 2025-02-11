import { fetchPolaris } from "../utils";

export const getFieldsValue = (customer, fieldRule) => {
  if (fieldRule.propType) {
    return customer[fieldRule.propType]
  }

  const customData = customer.customFieldsData.find(cfd => cfd.field === fieldRule.fieldId);
  if (customData) {
    return customData.value;
  }
}

export const getCustomerFromPolaris = async (subdomain: string, customer, polarisConfig) => {
  let polarisCustomer;
  const { registerField, codeField } = polarisConfig;

  const custCode = getFieldsValue(customer, codeField);
  const registerCode = getFieldsValue(customer, registerField);

  const codes = { custCode, registerCode }

  if (custCode) {
    polarisCustomer = await getCustomerDetail(subdomain, polarisConfig, { code: custCode });

    if (polarisCustomer) {
      return { ...codes, polarisCustomer }
    }
  }

  if (registerCode) {
    polarisCustomer = await getCustomerDetailByRegister(subdomain, polarisConfig, { register: registerCode });

    if (polarisCustomer) {
      return { ...codes, polarisCustomer }
    }
  }

  return { ...codes, polarisCustomer };
}

interface IParams {
  code: string;
}

export const getCustomerDetail = async (subdomain: string, polarisConfig, params: IParams) => {
  if (!params.code) throw new Error('Code required!');

  let sendData = [params.code];

  return await fetchPolaris({
    subdomain,
    op: '13610310',
    data: sendData,
    polarisConfig,
    skipLog: true
  });
};

interface IParamsReg {
  register: string;
}

export const getCustomerDetailByRegister = async (
  subdomain: string,
  polarisConfig,
  params: IParamsReg
) => {
  if (!params.register) {
    throw new Error("Register required!");
  }

  let sendData = [params.register];

  return await fetchPolaris({
    subdomain,
    op: "13610335",
    data: sendData,
    polarisConfig,
    skipLog: true
  });
};
