import { putActivityLog as commonPutActivityLog } from '@erxes/api-utils/src/logUtils';
import messageBroker from './messageBroker';
export const putActivityLog = async (
  subdomain,
  params: { action: string; data: any }
) => {
  const { data } = params;

  const updatedParams = {
    ...params,
    data: { ...data, contentType: `cards:${data.contentType}` }
  };

  return commonPutActivityLog(subdomain, {
    messageBroker: messageBroker(),
    ...updatedParams
  });
};
