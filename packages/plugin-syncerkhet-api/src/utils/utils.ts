import { IModels } from '../connectionResolver';
import { sendCardsMessage } from '../messageBroker';
import { sendRPCMessage } from '../messageBrokerErkhet';

export const toErkhet = (models, syncLog, config, sendData, action) => {
  const postData = {
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(sendData)
  };

  sendRPCMessage(models, syncLog, 'rpc_queue:erxes-automation-erkhet', {
    action,
    payload: JSON.stringify(postData),
    thirdService: true
  });
};

export const getConfig = async (models: IModels, code, defaultValue?) => {
  return models.Configs.getConfig(code, defaultValue);
};

export const sendCardInfo = async (subdomain, deal, config, value) => {
  const field = config.responseField.replace('customFieldsData.', '');

  await sendCardsMessage({
    subdomain,
    action: 'deals.updateOne',
    data: {
      selector: { _id: deal._id },
      modifier: {
        $pull: {
          customFieldsData: { field }
        }
      }
    },
    isRPC: true
  });

  await sendCardsMessage({
    subdomain,
    action: 'deals.updateOne',
    data: {
      selector: { _id: deal._id },
      modifier: {
        $push: {
          customFieldsData: {
            field,
            value,
            stringValue: value
          }
        }
      }
    },
    isRPC: true
  });
};
