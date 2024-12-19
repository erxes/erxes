import { getFieldsValue } from "./customer/getCustomerDetail"
import { fetchPolaris, getCustomer, updateCustomer } from "./utils"

export const getObject = async (subdomain: string, contentId: string, contentType: string) => {
  if (contentType === 'customer') {
    return await getCustomer(subdomain, contentId)
  }
}

const getSendData = (content, code, polarisConfig) => {
  if (code === '13610335') {
    const register = getFieldsValue(content, polarisConfig.registerField)
    return [register]
  }

  if (code === '13610310') {
    const code = getFieldsValue(content, polarisConfig.codeField)
    return [code]
  }

  if (code === '13610312') {
    const code = getFieldsValue(content, polarisConfig.codeField)
    return [code, 0, 30]
  }

  return [];
}

export const getPullPolaris = async (subdomain: string, polarisConfig: any, content: any, code: string,) => {
  try {
    return await fetchPolaris({
      subdomain,
      op: code,
      data: [...getSendData(content, code, polarisConfig)],
      polarisConfig,
    });
  } catch (e) {
    throw new Error(e.message);
  }
}

export const checkAndSaveObj = async (subdomain, contentType, contentId, modifier) => {
  if (contentType === 'customer') {
    await updateCustomer(subdomain, { _id: contentId }, modifier)
  }
}
