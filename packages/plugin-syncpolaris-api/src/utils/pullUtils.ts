import { fetchPolaris, getCustomer } from "./utils"

export const getObject = async (subdomain: string, contentId: string, contentType: string) => {
  if (contentType === 'customer') {
    return await getCustomer(subdomain, contentId)
  }
}

const getSendData = (code) => {
  if (code === '13610312') {
    return [0, 10]
  }
  return [];
}

export const getPullPolaris = async (subdomain: string, polarisConfig: any, content: any, code: string,) => {
  return await fetchPolaris({
    subdomain,
    op: code,
    data: [content.code, ...getSendData(code)],
    polarisConfig,
  });
}
