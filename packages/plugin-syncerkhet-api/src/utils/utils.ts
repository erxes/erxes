import { sendCoreMessage } from '../messageBroker';
import { sendCommonMessage } from '../messageBrokerErkhet';

export const toErkhet = (config, sendData, action) => {
  const postData = {
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(sendData)
  };

  sendCommonMessage('rpc_queue:erxes-automation-erkhet', {
    action,
    payload: JSON.stringify(postData),
    thirdService: true
  });
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};
